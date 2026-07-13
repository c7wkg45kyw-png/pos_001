"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { SkeletonFilters, SkeletonTable } from "@/components/loading-skeleton";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createProduct, getCategories, getColors, getMaterials, getProducts, requireSessionToken } from "@/services/api";
import { defaultPermissions, getPermissions, type PermissionMatrix } from "@/services/permissions";
import type { CategorySummary, ColorSummary, MaterialSummary, ProductSummary } from "@/types/models";

function masterDataLabel(thaiName: string, englishName: string) {
  return thaiName && englishName ? `${thaiName} (${englishName})` : thaiName || englishName;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [materials, setMaterials] = useState<MaterialSummary[]>([]);
  const [colors, setColors] = useState<ColorSummary[]>([]);
  const [token, setToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [permissions, setPermissions] = useState<PermissionMatrix>(defaultPermissions());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [newImageDataUrl, setNewImageDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>(["skuName", "skuCode", "category", "material", "status"]);

  function closeProductModal() {
    setIsModalOpen(false);
    setNewImageDataUrl("");
  }

  useEffectOnce(() => {
    setPermissions(getPermissions());
    async function load() {
      setLoading(true);
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        const [productItems, categoryItems, materialItems, colorItems] = await Promise.all([
          getProducts(nextToken),
          getCategories(nextToken),
          getMaterials(nextToken),
          getColors(nextToken)
        ]);
        setProducts(productItems);
        setCategories(categoryItems);
        setMaterials(materialItems);
        setColors(colorItems);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load products.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  });

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const code = String(form.get("code") ?? "").trim().toUpperCase();
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

    if (!name || !code) {
      setMessage("Product name and code are required.");
      return;
    }
    if (!categoryId || !materialId || !colorId) {
      setMessage("Category, material, and color are required.");
      return;
    }
    if (!permissions.products.create) {
      setMessage("Product create permission is blocked.");
      return;
    }

    try {
      const product = await createProduct(token, {
        productName: name,
        productCode: code,
        description,
        imageDataUrl: newImageDataUrl,
        categoryId,
        materialId,
        colorId,
        features,
        width,
        length,
        height
      });
      setProducts((items) => [product, ...items]);
      setMessage(`${product.productName} saved to backend.`);
      setIsModalOpen(false);
      setNewImageDataUrl("");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setNewImageDataUrl("");
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
      setNewImageDataUrl(result);
      setMessage("Product image ready to save.");
    };
    reader.onerror = () => {
      setMessage("Could not read the selected PNG file.");
    };
    reader.readAsDataURL(file);
  }

  const defaultCategoryId = categories.find((item) => item.englishName === "Uncategorized")?.id ?? categories[0]?.id ?? "";
  const defaultMaterialId = materials.find((item) => item.englishName === "Not specified")?.id ?? materials[0]?.id ?? "";
  const defaultColorId = colors.find((item) => item.englishName === "Not specified")?.id ?? colors[0]?.id ?? "";
  const filteredProducts = products.filter((product) => {
    if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
      return false;
    }
    if (selectedMaterialId && product.materialId !== selectedMaterialId) {
      return false;
    }
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      const haystack = `${product.productName} ${product.productCode}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const productExportColumns = [
    { key: "skuName", label: "SKU Name" },
    { key: "skuCode", label: "SKU Code" },
    { key: "category", label: "Category" },
    { key: "material", label: "Material" },
    { key: "status", label: "Status" },
    { key: "width", label: "Width" },
    { key: "length", label: "Length" },
    { key: "height", label: "Height" },
    { key: "features", label: "Features" }
  ] as const;

  function toggleExportColumn(columnKey: string) {
    setSelectedExportColumns((current) =>
      current.includes(columnKey) ? current.filter((item) => item !== columnKey) : [...current, columnKey]
    );
  }

  function exportProductsCsv() {
    if (selectedExportColumns.length === 0) {
      setMessage("Select at least one column to export.");
      return;
    }

    const headerMap = Object.fromEntries(productExportColumns.map((column) => [column.key, column.label]));
    const rows = [
      selectedExportColumns.map((column) => headerMap[column] ?? column),
      ...filteredProducts.map((product) =>
        selectedExportColumns.map((column) => {
          switch (column) {
            case "skuName":
              return product.productName;
            case "skuCode":
              return product.productCode;
            case "category":
              return product.categoryName;
            case "material":
              return product.materialName;
            case "status":
              return product.active ? "active" : "inactive";
            case "width":
              return String(product.width ?? 0);
            case "length":
              return String(product.length ?? 0);
            case "height":
              return String(product.height ?? 0);
            case "features":
              return (product.features ?? []).join(" | ");
            default:
              return "";
          }
        })
      )
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "products-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
    setMessage("Products report exported.");
  }

  return (
    <AppShell
      active="/products"
      headerActions={
        <>
          <button className="button" type="button" onClick={() => setIsExportModalOpen(true)}>Export</button>
          <button className="button primary" type="button" onClick={() => { setNewImageDataUrl(""); setIsModalOpen(true); }} disabled={!permissions.products.create}>New Product</button>
        </>
      }
    >
      <div className="topbar">
        <div>
          <h1 className="title">Products</h1>
          <p className="subtitle">Configure products, services, and pricing reference data.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      {loading ? (
        <>
          <SkeletonFilters count={3} />
          <SkeletonTable rows={6} columns={6} />
        </>
      ) : (
        <>
      <div className="filters filters-products">
        <label className="field">
          <span>Category</span>
          <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {masterDataLabel(category.thaiName, category.englishName)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Material</span>
          <select value={selectedMaterialId} onChange={(event) => setSelectedMaterialId(event.target.value)}>
            <option value="">All materials</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {masterDataLabel(material.thaiName, material.englishName)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product name or code"
          />
        </label>
      </div>
        </>
      )}
      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={addProduct}>
            <div className="panel-heading">
              <h2>New Product</h2>
            </div>
            <label className="field">
              <span>Product Name</span>
              <input name="name" placeholder="Product name" autoFocus required />
            </label>
            <label className="field">
              <span>Code</span>
              <input name="code" placeholder="Code" required />
            </label>
            <label className="field">
              <span>Description</span>
              <input name="description" placeholder="Description" />
            </label>
            <label className="field">
              <span>Product Image (.PNG, max 2MB)</span>
              <input name="image" type="file" accept="image/png" onChange={handleImageChange} />
            </label>
            {newImageDataUrl ? (
              <div className="product-edit-image-preview">
                <img src={newImageDataUrl} alt="Product preview" className="product-detail-image" />
              </div>
            ) : null}
            <label className="field">
              <span>Category</span>
              <select name="categoryId" defaultValue={defaultCategoryId} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {masterDataLabel(category.thaiName, category.englishName)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Material</span>
              <select name="materialId" defaultValue={defaultMaterialId} required>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {masterDataLabel(material.thaiName, material.englishName)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Color</span>
              <select name="colorId" defaultValue={defaultColorId} required>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {masterDataLabel(color.thaiName, color.englishName)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Features</span>
              <textarea name="features" placeholder={"Feature 1\nFeature 2"} rows={4} />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Width</span>
                <input name="width" type="number" min="0" step="0.01" placeholder="0" />
              </label>
              <label className="field">
                <span>Length</span>
                <input name="length" type="number" min="0" step="0.01" placeholder="0" />
              </label>
              <label className="field">
                <span>Height</span>
                <input name="height" type="number" min="0" step="0.01" placeholder="0" />
              </label>
            </div>
            <div className="toolbar">
              <button className="button" type="button" onClick={closeProductModal}>Cancel</button>
              <button className="button primary" type="submit">Save Product</button>
            </div>
          </form>
        </div>
      )}
      {isExportModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <div className="panel-heading">
              <h2>Export Products CSV</h2>
              <button className="button compact" type="button" onClick={() => setIsExportModalOpen(false)}>Close</button>
            </div>
            <div className="checkbox-grid">
              {productExportColumns.map((column) => (
                <label className="checkbox-field" key={column.key}>
                  <input
                    type="checkbox"
                    checked={selectedExportColumns.includes(column.key)}
                    onChange={() => toggleExportColumn(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>
            <div className="toolbar">
              <button className="button primary" type="button" onClick={exportProductsCsv}>Download CSV</button>
            </div>
          </div>
        </div>
      ) : null}
      {!loading ? (
      <DataTable
        headers={["Image", "SKU", "Category", "Material", "Status", "Action"]}
        rows={filteredProducts.map((product) => [
          product.imageDataUrl ? (
            <img className="product-table-image" src={product.imageDataUrl} alt={product.productName} key={`${product.id}-image`} />
          ) : (
            <div className="product-table-image product-table-image-fallback" key={`${product.id}-image`}>
              {product.productCode.slice(0, 2) || "SKU"}
            </div>
          ),
          <div className="product-cell" key={product.id}>
            <strong>{product.productName}</strong>
            <span>{product.productCode}</span>
          </div>,
          product.categoryName,
          product.materialName,
          product.active ? "active" : "inactive",
          <Link className="button compact" href={`/products/${product.id}`} key={product.id}>Details</Link>
        ])}
      />
      ) : null}
    </AppShell>
  );
}
