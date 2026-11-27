import React from "react";
import {
  faImage,
  faPalette,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../../shared/components/Inputs/Select";
import type {
  ColorRecord,
  DraftColorBlock,
  DraftSizeVariant,
  SizeRecord,
} from "../services/ProductServices";

interface ProductColorsEditorProps {
  colorBlocks: DraftColorBlock[];
  onChange: React.Dispatch<React.SetStateAction<DraftColorBlock[]>>;
  colors: ColorRecord[];
  sizes: SizeRecord[];
  title?: string;
  subtitle?: string;
}

export const ProductColorsEditor: React.FC<ProductColorsEditorProps> = ({
  colorBlocks,
  onChange,
  colors,
  sizes,
  title = "Variantes de Color, Imágenes y Tallas",
  subtitle = "Agrega colores, múltiples URLs de imagen por color y sus tallas con stock",
}) => {
  const handleAddColorBlock = () => {
    const defaultColor = colors[0] ? String(colors[0].id) : "";
    const defaultSize = sizes[0] ? String(sizes[0].id) : "";
    onChange((prev) => [
      ...prev,
      {
        colorId: defaultColor,
        images: [""],
        sizes: defaultSize ? [{ sizeId: defaultSize, currentStock: "0", discount: "0" }] : [],
      },
    ]);
  };

  const handleRemoveColorBlock = (index: number) => {
    onChange((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleColorIdChange = (index: number, colorId: string) => {
    onChange((prev) =>
      prev.map((block, idx) => (idx === index ? { ...block, colorId } : block))
    );
  };

  const handleAddImage = (colorIndex: number) => {
    onChange((prev) =>
      prev.map((block, idx) =>
        idx === colorIndex ? { ...block, images: [...block.images, ""] } : block
      )
    );
  };

  const handleImageChange = (colorIndex: number, imgIndex: number, value: string) => {
    onChange((prev) =>
      prev.map((block, idx) =>
        idx === colorIndex
          ? {
              ...block,
              images: block.images.map((url, i) => (i === imgIndex ? value : url)),
            }
          : block
      )
    );
  };

  const handleRemoveImage = (colorIndex: number, imgIndex: number) => {
    onChange((prev) =>
      prev.map((block, idx) =>
        idx === colorIndex
          ? {
              ...block,
              images: block.images.filter((_, i) => i !== imgIndex),
            }
          : block
      )
    );
  };

  const handleAddSize = (colorIndex: number) => {
    const defaultSize = sizes[0] ? String(sizes[0].id) : "";
    onChange((prev) =>
      prev.map((block, idx) =>
        idx === colorIndex
          ? {
              ...block,
              sizes: [
                ...block.sizes,
                { sizeId: defaultSize, currentStock: "0", discount: "0" },
              ],
            }
          : block
      )
    );
  };

  const handleRemoveSize = (colorIndex: number, sizeIndex: number) => {
    onChange((prev) =>
      prev.map((block, idx) =>
        idx === colorIndex
          ? { ...block, sizes: block.sizes.filter((_, sIdx) => sIdx !== sizeIndex) }
          : block
      )
    );
  };

  const handleSizeChange = (
    colorIndex: number,
    sizeIndex: number,
    field: keyof DraftSizeVariant,
    value: string
  ) => {
    onChange((prev) =>
      prev.map((block, idx) =>
        idx === colorIndex
          ? {
              ...block,
              sizes: block.sizes.map((sz, sIdx) =>
                sIdx === sizeIndex ? { ...sz, [field]: value } : sz
              ),
            }
          : block
      )
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-app-border bg-app-surface-alt/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-app-text block">
            {title}
          </span>
          <p className="text-[11px] text-app-muted">{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={faPlus}
          onClick={handleAddColorBlock}
          disabled={colors.length === 0}
        >
          Agregar Color
        </Button>
      </div>

      {colorBlocks.length > 0 && (
        <div className="space-y-3">
          {colorBlocks.map((block, cIdx) => (
            <div
              key={`color-block-${cIdx}`}
              className="rounded-xl border border-app-border bg-app-surface p-3.5 space-y-3"
            >
              {/* Selección de Color */}
              <div className="flex items-end gap-2.5">
                <div className="flex-1 min-w-0">
                  <Select
                    label="Color"
                    size="sm"
                    value={block.colorId}
                    onChange={(e) => handleColorIdChange(cIdx, e.target.value)}
                    iconLeft={faPalette}
                    options={colors.map((c) => ({
                      value: String(c.id),
                      label: `${c.color} (${c.hex})`,
                    }))}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={faTrash}
                  onClick={() => handleRemoveColorBlock(cIdx)}
                  className="shrink-0 h-8.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                  title="Quitar color"
                />
              </div>

              {/* Imágenes del Color (múltiples URLs) */}
              <div className="space-y-2 border-t border-app-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-app-muted">
                    Imágenes del Color ({block.images.length})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={faPlus}
                    onClick={() => handleAddImage(cIdx)}
                  >
                    Imagen
                  </Button>
                </div>

                {block.images.length === 0 ? (
                  <p className="text-[11px] text-app-muted">
                    Sin URLs de imagen para este color.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {block.images.map((imgUrl, imgIdx) => (
                      <div
                        key={`img-${cIdx}-${imgIdx}`}
                        className="flex items-center gap-2.5"
                      >
                        {imgUrl.trim() && (
                          <img
                            src={imgUrl.trim()}
                            alt={`Color ${cIdx + 1} imagen ${imgIdx + 1}`}
                            onError={(e) => {
                              e.currentTarget.src = "/shoesGreenSplash.jpg";
                            }}
                            className="size-8.5 shrink-0 rounded-lg object-cover border border-app-border bg-app-surface-alt"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Input
                            size="sm"
                            type="text"
                            maxLength={255}
                            value={imgUrl}
                            onChange={(e) =>
                              handleImageChange(cIdx, imgIdx, e.target.value)
                            }
                            placeholder={`URL imagen ${imgIdx + 1} (https://...)`}
                            iconLeft={faImage}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={faTrash}
                          onClick={() => handleRemoveImage(cIdx, imgIdx)}
                          className="shrink-0 h-8.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                          title="Quitar imagen"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tallas y Stock */}
              <div className="space-y-2.5 border-t border-app-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-app-muted">
                    Tallas y Stock
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={faPlus}
                    onClick={() => handleAddSize(cIdx)}
                    disabled={sizes.length === 0}
                  >
                    Talla
                  </Button>
                </div>

                {block.sizes.map((sz, sIdx) => (
                  <div
                    key={`size-${cIdx}-${sIdx}`}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_96px_96px_auto] gap-2.5 items-end"
                  >
                    <div className="min-w-0">
                      <Select
                        label={sIdx === 0 ? "Talla" : undefined}
                        size="sm"
                        value={sz.sizeId}
                        onChange={(e) =>
                          handleSizeChange(cIdx, sIdx, "sizeId", e.target.value)
                        }
                        options={sizes.map((item) => ({
                          value: String(item.id),
                          label: `${item.sizeNumber} (${item.internationalSize}) · ${item.gender}`,
                        }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <Input
                        label={sIdx === 0 ? "Stock" : undefined}
                        size="sm"
                        type="number"
                        min="0"
                        value={sz.currentStock}
                        onChange={(e) =>
                          handleSizeChange(cIdx, sIdx, "currentStock", e.target.value)
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <Input
                        label={sIdx === 0 ? "Desc. %" : undefined}
                        size="sm"
                        type="number"
                        min="0"
                        max="100"
                        value={sz.discount}
                        onChange={(e) =>
                          handleSizeChange(cIdx, sIdx, "discount", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={faTrash}
                        onClick={() => handleRemoveSize(cIdx, sIdx)}
                        className="shrink-0 h-8.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                        title="Quitar talla"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductColorsEditor;
