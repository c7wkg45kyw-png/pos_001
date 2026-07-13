"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { getCategories, getColors, getMaterials, getProducts, requireSessionToken, updateProduct } from "@/services/api";
import { defaultPermissions, getPermissions, type PermissionMatrix } from "@/services/permissions";
import type { CategorySummary, ColorSummary, MaterialSummary, ProductSummary } from "@/types/models";

function masterDataLabel(thaiName: string, englishName: string) {
  return thaiName && englishName ? `${thaiName} (${englishName})` : thaiName || englishName;
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [materials, setMaterials] = useState<MaterialSummary[]>([]);
  const [colors, setColors] = useState<ColorSummary[]>([]);
  const [token, setToken] = useState("");
  const [permissions, setPermissions] = useState<PermissionMatrix>(defaultPermissions());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editImageDataUrl, setEditImageDataUrl] = useState("");
  const [message, setMessage] = useState("Loading product details...");

  useEffect(() => {
    async function load() {
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        setPermissions(getPermissions());
        const [products, categoryItems, materialItems, colorItems] = await Promise.all([
          getProducts(nextToken),
          getCategories(nextToken),
          getMaterials(nextToken),
          getColors(nextToken)
        ]);
        const match = products.find((item) => item.id === params.id) ?? null;
        setProduct(match);
        setEditImageDataUrl(match?.imageDataUrl ?? "");
        setCategories(categoryItems);
        setMaterials(materialItems);
        setColors(colorItems);
        setMessage(match ? "Product details loaded from backend." : "Product not found.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load product details.");
      }
    }
    void load();
  }, [params.id]);

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const productName = String(form.get("name") ?? "").trim();
    const productCode = String(form.get("code") ?? "").trim().toUpperCase();
    const description = String(form.get("description") ?? "").trim();
    const categoryId = String(form.get("categoryId") ?? "").trim();
    const materialId = String(form.get("materialId") ?? "").trim();
    const colorId = String(form.get("colorId") ?? "").trim();
    const features = String(form.get("features") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const width = Number(form.get("width") ?? 0) || 0;
    const length = Number(form.get("length") ?? 0) || 0;
    const height = Number(form.get("height") ?? 0) || 0;

    if (!productName || !productCode) {
      setMessage("Product name and code are required.");
      return;
    }
    if (!categoryId || !materialId || !colorId) {
      setMessage("Category, material, and color are required.");
      return;
    }

    try {
      const updated = await updateProduct(token, product.id, {
        productName,
        productCode,
        description,
        imageDataUrl: editImageDataUrl,
        categoryId,
        materialId,
        colorId,
        features,
        width,
        length,
        height,
        active: product.active
      });
      setProduct(updated);
      setMessage(`${updated.productName} updated successfully.`);
      setIsEditOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update product.");
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setEditImageDataUrl(product?.imageDataUrl ?? "");
      return;
    }
    if (file.type !== "image/png") {
      setMessage("Only PNG files are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("PNG file size must not exceed 2MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setEditImageDataUrl(result);
      setMessage("Product image ready to save.");
    };
    reader.onerror = () => {
      setMessage("Could not read the selected PNG file.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <AppShell active="/products">
      <div className="topbar">
        <div>
          <h1 className="title">Product Details</h1>
          <p className="subtitle">{product?.productName ?? params.id}</p>
        </div>
        <div className="toolbar">
          {permissions.products.update ? (
            <button className="button primary" type="button" onClick={() => setIsEditOpen(true)} disabled={!product}>
              Edit
            </button>
          ) : null}
          <Link className="button" href="/products">Back</Link>
        </div>
      </div>
      <div className="notice">{message}</div>
      {product && (
        <section className="product-detail-layout">
          <div className="product-detail-image-card">
            {product.imageDataUrl ? (
              <img src={product.imageDataUrl} alt={product.productName} className="product-detail-image" />
            ) : (
              <div className="product-detail-image-placeholder">PNG Preview</div>
            )}
          </div>
          <div className="detail-item"><span>Product ID</span><strong>{product.id}</strong></div>
          <div className="detail-item"><span>Code</span><strong>{product.productCode}</strong></div>
          <div className="detail-item"><span>Name</span><strong>{product.productName}</strong></div>
          <div className="detail-item"><span>Category</span><strong>{product.categoryName}</strong></div>
          <div className="detail-item"><span>Material</span><strong>{product.materialName}</strong></div>
          <div className="detail-item"><span>Color</span><strong>{product.colorName}</strong></div>
          <div className="detail-item"><span>Width, Height, Length</span><strong>{product.width}, {product.height}, {product.length}</strong></div>
          <div className="detail-item"><span>Status</span><strong>{product.active ? "active" : "inactive"}</strong></div>
          <div className="detail-item wide"><span>Features</span><strong>{product.features.length ? product.features.join(", ") : "-"}</strong></div>
          <div className="detail-item wide"><span>Description</span><strong>{product.description || "-"}</strong></div>
        </section>
      )}
      {product && isEditOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={saveProduct}>
            <div className="panel-heading">
              <h2>Edit Product</h2>
              <button className="button compact" type="button" onClick={() => setIsEditOpen(false)}>Close</button>
            </div>
            <label className="field">
              <span>Product Name</span>
              <input name="name" defaultValue={product.productName} autoFocus required />
            </label>
            <label className="field">
              <span>Code</span>
              <input name="code" defaultValue={product.productCode} required />
            </label>
            <label className="field">
              <span>Description</span>
              <input name="description" defaultValue={product.description} />
            </label>
            <label className="field">
              <span>Product Image (.PNG, max 2MB)</span>
              <input name="image" type="file" accept="image/png" onChange={handleImageChange} />
            </label>
            {editImageDataUrl ? (
              <div className="product-edit-image-preview">
                <img src={editImageDataUrl} alt="Product preview" className="product-detail-image" />
              </div>
            ) : null}
            <label className="field">
              <span>Category</span>
              <select name="categoryId" defaultValue={product.categoryId} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {masterDataLabel(category.thaiName, category.englishName)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Material</span>
              <select name="materialId" defaultValue={product.materialId} required>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {masterDataLabel(material.thaiName, material.englishName)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Color</span>
              <select name="colorId" defaultValue={product.colorId} required>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {masterDataLabel(color.thaiName, color.englishName)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Features</span>
              <textarea name="features" defaultValue={product.features.join("\n")} rows={4} />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Width</span>
                <input name="width" type="number" min="0" step="0.01" defaultValue={product.width} />
              </label>
              <label className="field">
                <span>Length</span>
                <input name="length" type="number" min="0" step="0.01" defaultValue={product.length} />
              </label>
              <label className="field">
                <span>Height</span>
                <input name="height" type="number" min="0" step="0.01" defaultValue={product.height} />
              </label>
            </div>
            <div className="toolbar">
              <button className="button" type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button className="button primary" type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
