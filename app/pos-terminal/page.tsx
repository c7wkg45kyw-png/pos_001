"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { POSReceiptPreview } from "@/components/pos-receipt-preview";
import { createPOSTransaction, getCustomers, getLoyaltyCoupons, getLoyaltyEarningRules, getLoyaltyRewards, getLoyaltyTier, getLoyaltyTiers, getMemberBenefits, getMemberPointBalances, getPaymentMethods, getPOSCatalog, getProducts, redeemMemberBenefit, requireSessionToken } from "@/services/api";
import type { CustomerSummary, LoyaltyCouponSummary, LoyaltyEarningRuleSummary, LoyaltyRewardSummary, LoyaltyTierDetailSummary, MemberBenefitSummary, MemberPointBalanceSummary, PaymentMethodSummary, POSCatalogItemSummary, POSTransactionSummary, ProductSummary } from "@/types/models";
import { formatCurrency } from "@/utils/format";

type CartLine = {
  cartKey: string;
  productId: string;
  productCode: string;
  productName: string;
  barcode: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  sourceType?: "catalog" | "reward";
  rewardSourceRefId?: string;
};

type ReceiptSnapshot = {
  customerName: string;
  paymentMethodName: string;
  currentPoints?: number;
  earnedPoints?: number;
  billDiscount: number;
  specialDiscount: number;
  appliedBenefits: Array<{
    benefitId: string;
    label: string;
    count: number;
    totalDiscount: number;
  }>;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

type AppliedRedeem = {
  benefitId: string;
  benefitUsage: Array<{ benefitId: string; count: number }>;
  code: string;
  label: string;
  count: number;
  discountAmount: number;
  rewardUsePoint: number;
  rewardProductId?: string;
  rewardProductName?: string;
};

type BenefitOption = {
  key: string;
  benefitId: string;
  benefitType: string;
  name: string;
  code: string;
  sourceRefId: string;
  amount: number;
  expiresAt: string;
  rewardType: string;
  usePoint: number;
  productId: string;
  productName: string;
};

function isExpired(value: string): boolean {
  if (!value) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.getTime() < Date.now();
}

function parseInteger(value: string): number {
  const matched = value.match(/-?\d+/);
  return matched ? Number(matched[0]) || 0 : 0;
}

function allocateBenefitUsage(
  benefits: MemberBenefitSummary[],
  benefitType: string,
  sourceRefId: string,
  requestedCount: number
): Array<{ benefitId: string; count: number }> {
  let remaining = requestedCount;
  const usage: Array<{ benefitId: string; count: number }> = [];
  for (const item of benefits.filter((benefit) => benefit.amount > 0 && benefit.benefitType === benefitType && benefit.sourceRefId === sourceRefId)) {
    if (remaining <= 0) {
      break;
    }
    const count = Math.min(item.amount, remaining);
    usage.push({ benefitId: item.id, count });
    remaining -= count;
  }
  return usage;
}

function parseCouponDiscount(coupon: LoyaltyCouponSummary | undefined, subtotal: number): AppliedRedeem | null {
  if (!coupon || subtotal <= 0) {
    return null;
  }
  const rawValue = Number((coupon.valueLabel || "").replace(/[^0-9.]/g, "")) || 0;
  if (coupon.couponType === "Discount %") {
    const discountAmount = Math.min(subtotal, subtotal * (rawValue / 100));
    return { benefitId: coupon.id, benefitUsage: [{ benefitId: coupon.id, count: 1 }], code: coupon.couponCode, label: coupon.couponName, count: 1, discountAmount, rewardUsePoint: 0 };
  }
  if (coupon.couponType === "Discount Fixed") {
    const discountAmount = Math.min(subtotal, rawValue);
    return { benefitId: coupon.id, benefitUsage: [{ benefitId: coupon.id, count: 1 }], code: coupon.couponCode, label: coupon.couponName, count: 1, discountAmount, rewardUsePoint: 0 };
  }
  return null;
}

function parseRewardDiscount(reward: LoyaltyRewardSummary | undefined, subtotal: number): AppliedRedeem | null {
  if (!reward || subtotal <= 0) {
    return null;
  }
  if (reward.rewardType === "Product") {
    return null;
  }
  const discountAmount = Math.min(subtotal, reward.costPer);
  return {
    benefitId: reward.id,
    benefitUsage: [{ benefitId: reward.id, count: 1 }],
    code: reward.id,
    label: reward.rewardName,
    count: 1,
    discountAmount,
    rewardUsePoint: reward.usePoint,
    rewardProductId: reward.productId,
    rewardProductName: reward.productName
  };
}

export default function POSTerminalPage() {
  const [catalog, setCatalog] = useState<POSCatalogItemSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [confirmedCustomerId, setConfirmedCustomerId] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountAmount, setDiscountAmount] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [message, setMessage] = useState("Loading POS terminal...");
  const [memberBenefits, setMemberBenefits] = useState<MemberBenefitSummary[]>([]);
  const [memberPointBalances, setMemberPointBalances] = useState<MemberPointBalanceSummary[]>([]);
  const [loyaltyCoupons, setLoyaltyCoupons] = useState<LoyaltyCouponSummary[]>([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyRewardSummary[]>([]);
  const [earningRules, setEarningRules] = useState<LoyaltyEarningRuleSummary[]>([]);
  const [loyaltyTierDetails, setLoyaltyTierDetails] = useState<LoyaltyTierDetailSummary[]>([]);
  const [selectedRedeemKeys, setSelectedRedeemKeys] = useState<string[]>([]);
  const [selectedRedeemQuantities, setSelectedRedeemQuantities] = useState<Record<string, number>>({});
  const [appliedRedeems, setAppliedRedeems] = useState<AppliedRedeem[]>([]);
  const [lastReceipt, setLastReceipt] = useState<POSTransactionSummary | null>(null);
  const [lastReceiptSnapshot, setLastReceiptSnapshot] = useState<ReceiptSnapshot | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCartCollapsed, setIsCartCollapsed] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  function notifyMemberBenefitsUpdated(customerId: string) {
    if (typeof window === "undefined") {
      return;
    }
    const payload = JSON.stringify({ customerId, time: Date.now() });
    window.localStorage.setItem("member-benefits-updated", payload);
    window.dispatchEvent(new CustomEvent("member-benefits-updated", { detail: { customerId } }));
  }

  useEffect(() => {
    async function load() {
      try {
        const token = requireSessionToken();
        const [catalogItems, customerItems, methodItems, productItems] = await Promise.all([
          getPOSCatalog(token),
          getCustomers(token),
          getPaymentMethods(token),
          getProducts(token)
        ]);
        setCatalog(catalogItems.filter((item) => item.active));
        setProducts(productItems.filter((item) => item.active));
        setCustomers(customerItems);
        setPaymentMethods(methodItems.filter((item) => item.isActive));
        const [couponItems, rewardItems, earningRuleItems, pointBalances, tierItems] = await Promise.all([
          getLoyaltyCoupons(token),
          getLoyaltyRewards(token),
          getLoyaltyEarningRules(token),
          getMemberPointBalances(token),
          getLoyaltyTiers(token)
        ]);
        const tierDetails = await Promise.all(tierItems.map((item) => getLoyaltyTier(token, item.id)));
        setLoyaltyCoupons(couponItems);
        setLoyaltyRewards(rewardItems);
        setEarningRules(earningRuleItems);
        setMemberPointBalances(pointBalances);
        setLoyaltyTierDetails(tierDetails);
        setSelectedPaymentMethodId(methodItems[0]?.id ?? "");
        setMessage("POS terminal ready.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load POS terminal.");
      }
    }
    void load();
  }, []);

  useEffect(() => {
    searchRef.current?.focus();
  }, [lastReceipt]);

  const productMetaMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(catalog.map((item) => item.categoryName)))], [catalog]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (category !== "All" && item.categoryName !== category) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [
        item.productCode,
        item.productName,
        item.barcode,
        item.categoryName
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [catalog, category, search]);

  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) {
      return customers;
    }
    return customers.filter((customer) =>
      [customer.customerName, customer.phone ?? "", customer.accountCode].some((value) => value.toLowerCase().includes(query))
    );
  }, [customerSearch, customers]);

  const walkInCustomer = useMemo(
    () => customers.find((item) => item.accountCode === "POS-WALKIN") ?? null,
    [customers]
  );

  const searchResultCustomer = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) {
      return walkInCustomer;
    }

    const exactMatch = customers.find((customer) =>
      [customer.customerName, customer.phone ?? "", customer.accountCode]
        .map((value) => value.toLowerCase())
        .some((value) => value === query)
    );
    if (exactMatch) {
      return exactMatch;
    }
    if (visibleCustomers.length > 0) {
      return visibleCustomers[0];
    }
    return null;
  }, [customerSearch, customers, visibleCustomers, walkInCustomer]);

  const selectedCustomer = useMemo(() => {
    if (!confirmedCustomerId) {
      return walkInCustomer;
    }
    return customers.find((item) => item.id === confirmedCustomerId) ?? walkInCustomer;
  }, [confirmedCustomerId, customers, walkInCustomer]);
  const isMemberCustomer = Boolean(selectedCustomer && selectedCustomer.accountCode !== "POS-WALKIN");
  const checkoutCustomer = isMemberCustomer ? selectedCustomer : walkInCustomer;

  useEffect(() => {
    async function loadBenefits() {
      if (!selectedCustomer?.id || !isMemberCustomer) {
        setMemberBenefits([]);
        setAppliedRedeems([]);
        setSelectedRedeemKeys([]);
        setSelectedRedeemQuantities({});
        return;
      }
      try {
        const token = requireSessionToken();
        setMemberBenefits(await getMemberBenefits(token, selectedCustomer.id));
      } catch {
        setMemberBenefits([]);
      }
      setAppliedRedeems([]);
      setSelectedRedeemKeys([]);
      setSelectedRedeemQuantities({});
    }
    void loadBenefits();
  }, [isMemberCustomer, selectedCustomer?.id]);

  const cartQuantityMap = useMemo(() => {
    return cart.reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = item.quantity;
      return acc;
    }, {});
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice;
    return Number.isFinite(lineTotal) ? sum + lineTotal : sum;
  }, 0);
  const normalizedDiscount = Math.min(Math.max(Number(discountAmount) || 0, 0), subtotal);
  const rawSpecialDiscount = appliedRedeems.reduce((sum, item) => sum + item.discountAmount, 0);
  const specialDiscount = Math.min(rawSpecialDiscount, Math.max(subtotal - normalizedDiscount, 0));
  const totalDiscount = normalizedDiscount + specialDiscount;
  const discountRatio = subtotal > 0 ? totalDiscount / subtotal : 0;
  const vat = cart.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    if (!Number.isFinite(lineSubtotal)) {
      return sum;
    }
    const discountedLineSubtotal = lineSubtotal * (1 - discountRatio);
    const lineVAT = discountedLineSubtotal * item.taxRate;
    return Number.isFinite(lineVAT) ? sum + lineVAT : sum;
  }, 0);
  const grandTotal = subtotal - totalDiscount + vat;
  const change = Math.max((Number(amountReceived) || 0) - grandTotal, 0);
  const currentPoints = isMemberCustomer && selectedCustomer ? (memberPointBalances.find((item) => item.customerId === selectedCustomer.id)?.currentPoints ?? 0) : 0;
  const activePointRule = useMemo(() => {
    if (!selectedCustomer?.id) {
      return null;
    }
    const tierDetail = loyaltyTierDetails.find((tier) => tier.members.some((member) => member.customerId === selectedCustomer.id));
    if (!tierDetail) {
      return null;
    }
    const linkedRule = tierDetail.benefits.find((benefit) => benefit.benefitType === "EarningRule" || benefit.benefitType === "Earning Rule");
    if (linkedRule) {
      const exactRule = earningRules.find((item) => item.id === linkedRule.refId);
      if (exactRule) {
        return exactRule;
      }
    }
    return earningRules.find((item) => item.loyaltyTierId === tierDetail.tier.id) ?? null;
  }, [earningRules, loyaltyTierDetails, selectedCustomer?.id]);
  const earnedPoints = isMemberCustomer && activePointRule
    ? Math.floor(Math.max(grandTotal, 0) / Math.max(parseInteger(activePointRule.triggerRule), 1)) * Math.max(parseInteger(activePointRule.rewardLogic), 0)
    : 0;

  const availableBenefitOptions = useMemo<BenefitOption[]>(() => {
    const aggregate = new Map<string, BenefitOption>();
    for (const benefit of memberBenefits) {
      if (benefit.amount <= 0 || isExpired(benefit.expiresAt)) {
        continue;
      }
      const reward = loyaltyRewards.find((item) => item.id === benefit.sourceRefId);
      const coupon = loyaltyCoupons.find((item) => item.id === benefit.sourceRefId);
      const key = `${benefit.benefitType}:${benefit.sourceRefId || benefit.code}`;
      const existing = aggregate.get(key);
      if (existing) {
        existing.amount += benefit.amount;
        continue;
      }
      aggregate.set(key, {
        key,
        benefitId: benefit.id,
        benefitType: benefit.benefitType,
        name: benefit.name,
        code: benefit.code,
        sourceRefId: benefit.sourceRefId,
        amount: benefit.amount,
        expiresAt: benefit.expiresAt,
        rewardType: reward?.rewardType ?? "Discount",
        usePoint: reward?.usePoint ?? 0,
        productId: reward?.productId ?? "",
        productName: reward?.productName ?? ""
      });
    }
    return Array.from(aggregate.values());
  }, [loyaltyCoupons, loyaltyRewards, memberBenefits]);

  function upsertCartItem(product: POSCatalogItemSummary) {
    if (!Number.isFinite(product.basicPrice) || product.basicPrice <= 0) {
      setMessage(`${product.productName} has no POS price. Please set a product price tier before checkout.`);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.productId && item.sourceType !== "reward");
      if (existing) {
        return current.map((item) => item.cartKey === existing.cartKey ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...current,
        {
          cartKey: `catalog:${product.productId}`,
          productId: product.productId,
          productCode: product.productCode,
          productName: product.productName,
          barcode: product.barcode,
          unitPrice: product.basicPrice,
          taxRate: product.taxRate,
          quantity: 1,
          sourceType: "catalog"
        }
      ];
    });
  }

  function addRewardProductToCart(reward: LoyaltyRewardSummary, quantity: number) {
    if (!reward.productId) {
      setMessage(`Reward ${reward.rewardName} is missing a linked product.`);
      return;
    }
    const catalogProduct = catalog.find((item) => item.productId === reward.productId);
    const product = products.find((item) => item.id === reward.productId);
    if (!catalogProduct || !product) {
      setMessage(`Reward product for ${reward.rewardName} was not found in catalog.`);
      return;
    }
    setCart((current) => {
      const key = `reward:${reward.id}`;
      const existing = current.find((item) => item.cartKey === key);
      if (existing) {
        return current.map((item) => item.cartKey === key ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [
        ...current,
        {
          cartKey: key,
          productId: reward.productId,
          productCode: product.productCode,
          productName: reward.productName || reward.rewardName,
          barcode: product.barcode ?? catalogProduct.barcode,
          unitPrice: 0,
          taxRate: catalogProduct.taxRate,
          quantity,
          sourceType: "reward",
          rewardSourceRefId: reward.id
        }
      ];
    });
  }

  function handleCatalogSearchSubmit() {
    const exact = catalog.find((item) => item.barcode === search.trim() || item.productCode.toLowerCase() === search.trim().toLowerCase());
    if (exact) {
      upsertCartItem(exact);
      setSearch("");
    }
  }

  async function checkout(paymentMethodId: string, receivedAmount?: number) {
    if (cart.length === 0) {
      setMessage("Cart is empty.");
      return;
    }
    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      setMessage("Net total is 0. Please check product prices before payment.");
      return;
    }
    const tenderedAmount = receivedAmount ?? Number(amountReceived);
    if (!Number.isFinite(tenderedAmount) || tenderedAmount < grandTotal) {
      setMessage("Amount received is required and must be greater than or equal to Net Total.");
      return;
    }
    setIsSaving(true);
    try {
      const token = requireSessionToken();
      const paymentMethodName = paymentMethods.find((item) => item.id === paymentMethodId)?.englishName
        || paymentMethods.find((item) => item.id === paymentMethodId)?.thaiName
        || paymentMethodId;
      const receiptSnapshot: ReceiptSnapshot = {
        customerName: selectedCustomer?.customerName || "General Customer",
        paymentMethodName,
        currentPoints: isMemberCustomer ? currentPoints : undefined,
        earnedPoints: isMemberCustomer ? earnedPoints : undefined,
        billDiscount: normalizedDiscount,
        specialDiscount,
        appliedBenefits: appliedRedeems.map((item) => ({
          benefitId: item.benefitId,
          label: item.label,
          count: item.count,
          totalDiscount: item.discountAmount
        })),
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      };
      const receipt = await createPOSTransaction(token, {
        customerId: checkoutCustomer?.id ?? "",
        customerPhone: isMemberCustomer ? selectedCustomer?.phone ?? "" : "",
        paymentMethodId,
        discountAmount: totalDiscount,
        amountReceived: tenderedAmount,
        lines: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceOverride: item.unitPrice,
          isReward: item.sourceType === "reward"
        }))
      });
      for (const redeem of appliedRedeems) {
        for (const usage of redeem.benefitUsage) {
          for (let index = 0; index < usage.count; index += 1) {
            await redeemMemberBenefit(token, selectedCustomer?.id ?? "", {
              benefitId: usage.benefitId,
              posTransactionNumber: receipt.transactionNumber
            });
          }
        }
      }
      setLastReceipt(receipt);
      setLastReceiptSnapshot(receiptSnapshot);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`pos-receipt:${receipt.transactionNumber}`, JSON.stringify(receiptSnapshot));
      }
      setCart([]);
      setAppliedRedeems([]);
      setSelectedRedeemKeys([]);
      setSelectedRedeemQuantities({});
      setDiscountAmount("");
      setAmountReceived("");
      setMemberBenefits((current) =>
        current.map((item) => {
          const matched = appliedRedeems.flatMap((redeem) => redeem.benefitUsage).find((usage) => usage.benefitId === item.id);
          return matched ? { ...item, amount: Math.max(0, item.amount - matched.count) } : item;
        })
      );
      if (isMemberCustomer && selectedCustomer?.id) {
        const spentPoints = appliedRedeems.reduce((sum, redeem) => sum + (redeem.rewardUsePoint * redeem.count), 0);
        setMemberPointBalances((current) =>
          current.map((item) =>
            item.customerId === selectedCustomer.id
              ? {
                  ...item,
                  currentPoints: Math.max(0, item.currentPoints - spentPoints + earnedPoints),
                  earnedPoints: item.earnedPoints + earnedPoints,
                  spentPoints: item.spentPoints + spentPoints
                }
              : item
          )
        );
        notifyMemberBenefitsUpdated(selectedCustomer.id);
      }
      setMessage(`Transaction ${receipt.transactionNumber} completed.`);
      setSearch("");
      searchRef.current?.focus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete POS transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  function openCustomerModal() {
    setCustomerSearch("");
    setIsCustomerModalOpen(true);
  }

  function closeCustomerModal() {
    setIsCustomerModalOpen(false);
    setCustomerSearch("");
  }

  function confirmCustomerSelection() {
    setConfirmedCustomerId(searchResultCustomer?.id ?? "");
    setIsCustomerModalOpen(false);
  }

  function confirmRedeemCode() {
    const selectedBenefits = availableBenefitOptions.filter((item) => selectedRedeemKeys.includes(item.key) && item.amount > 0);
    if (selectedBenefits.length === 0) {
      if (redeemCode.trim()) {
        applyRedeemCode(redeemCode.trim());
        return;
      }
      setMessage("Please select at least one coupon or reward.");
      return;
    }
    const nextApplied = selectedBenefits
      .map((benefit) => {
        const requestedCount = Math.min(
          benefit.amount,
          Math.max(1, selectedRedeemQuantities[benefit.key] ?? 1)
        );
        if (benefit.benefitType === "Reward" && benefit.usePoint * requestedCount > currentPoints) {
          setMessage(`Member points are not enough for ${benefit.name}.`);
          return null;
        }
        const coupon = loyaltyCoupons.find((item) => item.id === benefit.sourceRefId || item.couponCode.toLowerCase() === benefit.code.toLowerCase());
        const reward = loyaltyRewards.find((item) => item.id === benefit.sourceRefId || item.id.toLowerCase() === benefit.code.toLowerCase());
        const usage = allocateBenefitUsage(memberBenefits, benefit.benefitType, benefit.sourceRefId, requestedCount);
        if (benefit.benefitType === "Reward" && reward?.rewardType === "Product") {
          addRewardProductToCart(reward, requestedCount);
          return {
            benefitId: benefit.benefitId,
            benefitUsage: usage,
            code: reward.id,
            label: `${benefit.name} Reward`,
            count: requestedCount,
            discountAmount: 0,
            rewardUsePoint: benefit.usePoint,
            rewardProductId: reward.productId,
            rewardProductName: reward.productName || reward.rewardName
          };
        }
        const parsed = benefit.benefitType === "Reward" ? parseRewardDiscount(reward, subtotal) : parseCouponDiscount(coupon, subtotal);
        if (!parsed) {
          return null;
        }
        return {
          ...parsed,
          benefitId: benefit.benefitId,
          benefitUsage: usage,
          count: requestedCount,
          discountAmount: parsed.discountAmount * requestedCount,
          rewardUsePoint: benefit.benefitType === "Reward" ? benefit.usePoint : 0,
          label: `${benefit.name} ${benefit.benefitType === "Reward" ? "Reward" : "Coupon"}`
        };
      })
      .filter((item): item is AppliedRedeem => Boolean(item));
    setAppliedRedeems(nextApplied);
    setSelectedRedeemKeys(nextApplied.map((item) => {
      const matched = availableBenefitOptions.find((benefit) => benefit.benefitId === item.benefitId);
      return matched?.key ?? "";
    }).filter(Boolean));
    setMessage("Selected coupons and rewards applied to POS checkout.");
    setIsRedeemModalOpen(false);
    setRedeemCode("");
  }

  function applyRedeemCode(normalizedCode: string) {
    if (!normalizedCode) {
      setMessage("Please enter a coupon code before redeeming.");
      return;
    }
    const benefit = memberBenefits.find((item) => item.amount > 0 && item.code.toLowerCase() === normalizedCode.toLowerCase());
    if (!benefit) {
      setMessage("Coupon or reward code was not found in this member benefit list.");
      return;
    }
    if (isExpired(benefit.expiresAt)) {
      setMessage("This benefit is expired.");
      return;
    }
    const coupon = loyaltyCoupons.find((item) => item.id === benefit.sourceRefId || item.couponCode.toLowerCase() === normalizedCode.toLowerCase());
    const reward = loyaltyRewards.find((item) => item.id === benefit.sourceRefId || item.id.toLowerCase() === normalizedCode.toLowerCase());
    if (benefit.benefitType === "Reward" && (reward?.usePoint ?? 0) > currentPoints) {
      setMessage("Member points are not enough for this reward.");
      return;
    }
    if (benefit.benefitType === "Reward" && reward?.rewardType === "Product") {
      addRewardProductToCart(reward, 1);
      setAppliedRedeems([
        {
          benefitId: benefit.id,
          benefitUsage: [{ benefitId: benefit.id, count: 1 }],
          code: reward.id,
          label: `${benefit.name} Reward`,
          count: 1,
          discountAmount: 0,
          rewardUsePoint: reward.usePoint,
          rewardProductId: reward.productId,
          rewardProductName: reward.productName || reward.rewardName
        }
      ]);
      setSelectedRedeemKeys([`${benefit.benefitType}:${benefit.sourceRefId || benefit.code}`]);
      setMessage(`${reward.rewardName} added to POS cart.`);
      setIsRedeemModalOpen(false);
      setRedeemCode("");
      return;
    }
    const applied = benefit.benefitType === "Reward" ? parseRewardDiscount(reward, subtotal) : parseCouponDiscount(coupon, subtotal);
    if (!applied) {
      setMessage("This benefit cannot be applied in POS.");
      return;
    }
    setAppliedRedeems([
      {
        ...applied,
        benefitId: benefit.id,
        benefitUsage: [{ benefitId: benefit.id, count: 1 }],
        count: 1,
        discountAmount: applied.discountAmount,
        rewardUsePoint: benefit.benefitType === "Reward" ? (reward?.usePoint ?? 0) : 0,
        label: `${benefit.name} ${benefit.benefitType === "Reward" ? "Reward" : "Coupon"}`
      }
    ]);
    setSelectedRedeemKeys([`${benefit.benefitType}:${benefit.sourceRefId || benefit.code}`]);
    setMessage(`${applied.label} applied to POS checkout.`);
    setIsRedeemModalOpen(false);
    setRedeemCode("");
  }

  const customerSearchBar = (
    <button className="button pos-header-customer-trigger" type="button" onClick={openCustomerModal}>
      Customer Search
    </button>
  );

  return (
    <AppShell active="/pos-terminal" headerActions={customerSearchBar}>
      <div className="notice">{message}</div>

      <section className="pos-terminal-layout">
        <section className="card pos-catalog-panel">
          <div className="panel-heading">
            <h2>Product Catalog</h2>
          </div>
          <label className="field">
            <span>Search / Scan</span>
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCatalogSearchSubmit();
                }
              }}
              placeholder="Scan barcode or type SKU / product"
            />
          </label>
          <div className="pos-category-tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={item === category ? "button compact primary" : "button compact"}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="pos-product-grid">
            {visibleProducts.map((product) => (
              <button className="pos-product-card" key={product.productId} type="button" onClick={() => upsertCartItem(product)} title={product.productName}>
                <div className="pos-product-image-wrap">
                  {productMetaMap.get(product.productId)?.imageDataUrl ? (
                    <img
                      className="pos-product-image"
                      src={productMetaMap.get(product.productId)?.imageDataUrl}
                      alt={product.productName}
                    />
                  ) : (
                    <div className="pos-product-image pos-product-image-placeholder" aria-hidden="true">
                      {product.productName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="pos-product-meta">
                  <strong className="pos-product-name">{product.productName}</strong>
                  <small className="pos-product-barcode">{product.barcode || "No barcode"}</small>
                  <em>{formatCurrency(product.basicPrice * (1 + product.taxRate))}</em>
                </div>
                {cartQuantityMap[product.productId] ? <span className="pos-product-badge">{cartQuantityMap[product.productId]}</span> : null}
              </button>
            ))}
          </div>
        </section>

        <div className="pos-right-column">
          <section className="card pos-checkout-panel">
            <div className="panel-heading">
              <h2>Checkout</h2>
              <button className="button compact" type="button" onClick={() => setIsCartCollapsed((current) => !current)}>
                {isCartCollapsed ? "Expand" : "Collapse"}
              </button>
            </div>

            <div className="pos-customer-block">
              <div className="pos-customer-summary">
                <span>Customer</span>
                <strong>{selectedCustomer?.customerName || "General Customer"}</strong>
                <small>
                  {selectedCustomer?.phone
                    ? selectedCustomer.phone
                    : selectedCustomer?.accountCode === "POS-WALKIN"
                      ? "Walk-in profile"
                      : selectedCustomer?.accountCode || "No contact number"}
                </small>
              </div>
            </div>

            {!isCartCollapsed ? (
              <div className="pos-cart-table">
                <div className="pos-cart-head">
                  <span>Unit</span>
                  <span>Total</span>
                </div>
                <div className="pos-cart-body">
                  {cart.length > 0 ? cart.map((item) => (
                    <div className="pos-cart-row" key={item.cartKey}>
                      <div className="pos-cart-name-block">
                        <strong>{item.productName}</strong>
                      </div>
                      <small className="pos-cart-barcode">{item.barcode || item.productCode}</small>
                      <div className="pos-cart-metrics">
                        <span className="pos-cart-qty-label">Qty</span>
                        <input
                          className="pos-cart-qty-input"
                          type="number"
                          min={1}
                          max={99}
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(event) => {
                            const qty = Math.min(99, Math.max(1, Number(event.target.value) || 1));
                            setCart((current) => current.map((line) => line.cartKey === item.cartKey ? { ...line, quantity: qty } : line));
                          }}
                        />
                        <span>{formatCurrency(item.unitPrice)}</span>
                        <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
                        <button
                          className="pos-cart-remove-button"
                          type="button"
                          aria-label={`Remove ${item.productName}`}
                          title={`Remove ${item.productName}`}
                          onClick={() => setCart((current) => current.filter((line) => line.cartKey !== item.cartKey))}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M9 3h6m-9 4h12m-1 0-.7 11.2a2 2 0 0 1-2 1.8H9.7a2 2 0 0 1-2-1.8L7 7m3 4v5m4-5v5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )) : <div className="empty-state">No items in cart yet.</div>}
                </div>
              </div>
            ) : (
              <div className="card pos-cart-collapsed-note">
                <strong>Cart minimized</strong>
                <p>{cart.length} item(s) selected.</p>
              </div>
            )}

            <label className="field pos-discount-field">
              <span>Bill Discount</span>
              <input
                type="number"
                min={0}
                max={subtotal}
                value={discountAmount}
                onChange={(event) => setDiscountAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>

            <div className="pos-total-box">
              <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              {isMemberCustomer ? <div><span>Point</span><strong>{earnedPoints.toLocaleString("en-US")}</strong></div> : null}
              <div><span>Discount</span><strong>{formatCurrency(normalizedDiscount)}</strong></div>
              <div><span>Special Discount</span><strong>{formatCurrency(specialDiscount)}</strong></div>
              <div><span>VAT</span><strong>{formatCurrency(vat)}</strong></div>
              <div className="pos-net-total"><span>Net Total</span><strong>{formatCurrency(grandTotal)}</strong></div>
            </div>
            {appliedRedeems.length > 0 ? (
              <div className="pos-change-box">
                <strong>Applied Coupon:</strong>
                <div className="pos-applied-redeem-list">
                  {appliedRedeems.map((item) => (
                    <div key={item.benefitId}>
                      {item.label} (x{item.count})
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pos-payment-panel">
              <label className="field">
                <span>Payment Method</span>
                <select value={selectedPaymentMethodId} onChange={(event) => setSelectedPaymentMethodId(event.target.value)}>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>{method.englishName || method.thaiName}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Amount Received</span>
                <input type="number" min={0} value={amountReceived} onChange={(event) => setAmountReceived(event.target.value)} placeholder={grandTotal.toFixed(2)} />
              </label>
              <div className="pos-change-box">Change: {formatCurrency(change)}</div>
              <div className="pos-payment-buttons">
                <button className="button" type="button" onClick={() => setAmountReceived(String(grandTotal.toFixed(2)))}>Exact Cash</button>
                <button
                  className="button"
                  type="button"
                  onClick={() => setIsRedeemModalOpen(true)}
                  disabled={!isMemberCustomer}
                  title={isMemberCustomer ? "Redeem member benefit" : "Redeem is available for members only"}
                >
                  Redeem
                </button>
                <button className="button primary" type="button" disabled={isSaving} onClick={() => checkout(selectedPaymentMethodId)}>
                  {isSaving ? "Processing..." : "Pay"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>

      {lastReceipt ? (
        <POSReceiptPreview
          receipt={lastReceipt}
          items={(lastReceiptSnapshot?.items ?? []).map((item) => ({
            id: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))}
          customerName={lastReceiptSnapshot?.customerName || lastReceipt.customerName}
          paymentMethodName={lastReceiptSnapshot?.paymentMethodName || lastReceipt.paymentMethodName}
          currentPoints={lastReceiptSnapshot?.currentPoints}
          earnedPoints={lastReceiptSnapshot?.earnedPoints}
          billDiscount={lastReceiptSnapshot?.billDiscount}
          specialDiscount={lastReceiptSnapshot?.specialDiscount}
          appliedBenefits={lastReceiptSnapshot?.appliedBenefits}
          onClose={() => setLastReceipt(null)}
        />
      ) : null}

      {isCustomerModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={closeCustomerModal}>
          <div className="modal pos-customer-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="pos-customer-modal-body">
              <label className="field">
                <span>Customer Search</span>
                <input
                  autoFocus
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search customer by phone, name, or code"
                />
              </label>

              <div className="pos-customer-modal-result">
                <span>Result Search</span>
                <strong>{searchResultCustomer?.customerName || "General Customer"}</strong>
                <small>
                  {customerSearch.trim()
                    ? searchResultCustomer
                      ? searchResultCustomer.phone || searchResultCustomer.accountCode
                      : "No customer found. Confirm will use General Customer."
                    : "Confirm without search to use General Customer."}
                </small>
              </div>

              <div className="row-actions">
                <button className="button" type="button" onClick={closeCustomerModal}>Cancel</button>
                <button className="button primary" type="button" onClick={confirmCustomerSelection}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isRedeemModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsRedeemModalOpen(false)}>
          <div className="modal pos-customer-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="pos-customer-modal-body">
              <label className="field">
                <span>Redeem Coupon Code</span>
                <input
                  autoFocus
                  value={redeemCode}
                  onChange={(event) => setRedeemCode(event.target.value)}
                  placeholder="Enter coupon / reward code"
                />
              </label>

              <div className="pos-customer-modal-result">
                <span>Usage</span>
                <strong>{redeemCode.trim() || "Pending code entry"}</strong>
                <small>POS will validate this code against reward and coupon rules before applying the benefit.</small>
              </div>

              <div className="pos-customer-modal-result">
                <span>Benefit List</span>
                {isMemberCustomer ? (
                  memberBenefits.length > 0 ? (
                    <>
                      <strong>{selectedCustomer?.customerName || "Member"}</strong>
                      <small>Select a benefit below to auto-fill and apply the code.</small>
                      <div className="pos-benefit-list">
                        {availableBenefitOptions
                          .map((item) => (
                            <div key={item.key} className="pos-benefit-option">
                              <button
                                className={`button compact ${selectedRedeemKeys.includes(item.key) ? "primary" : ""}`}
                                type="button"
                                title={item.benefitType === "Reward" && item.usePoint > 0 ? `Use ${item.usePoint} point(s)` : item.code}
                                onClick={() => {
                                  setSelectedRedeemKeys((current) =>
                                    current.includes(item.key) ? current.filter((id) => id !== item.key) : [...current, item.key]
                                  );
                                  setSelectedRedeemQuantities((current) => ({ ...current, [item.key]: current[item.key] ?? 1 }));
                                }}
                                disabled={item.benefitType === "Reward" && item.usePoint > currentPoints}
                              >
                                {item.name} (x{item.amount})
                              </button>
                              {selectedRedeemKeys.includes(item.key) && item.amount > 1 ? (
                                <input
                                  className="pos-benefit-qty-input"
                                  type="number"
                                  min={1}
                                  max={item.amount}
                                  value={selectedRedeemQuantities[item.key] ?? 1}
                                  onChange={(event) =>
                                    setSelectedRedeemQuantities((current) => ({
                                      ...current,
                                      [item.key]: Math.min(item.amount, Math.max(1, Number(event.target.value) || 1))
                                    }))
                                  }
                                />
                              ) : null}
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>No benefits available</strong>
                      <small>This member does not have any coupon or reward ready to use.</small>
                    </>
                  )
                ) : (
                  <>
                    <strong>General Customer</strong>
                    <small>Redeem is available only for members.</small>
                  </>
                )}
              </div>

              <div className="row-actions">
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    setSelectedRedeemKeys([]);
                    setSelectedRedeemQuantities({});
                    setRedeemCode("");
                    setAppliedRedeems([]);
                  }}
                >
                  Clear
                </button>
                <button className="button" type="button" onClick={() => setIsRedeemModalOpen(false)}>Cancel</button>
                <button className="button primary" type="button" onClick={confirmRedeemCode}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
