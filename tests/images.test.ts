// Trimming empty margins off an uploaded logo (src/admin/images.ts).
import { describe, expect, it } from "vitest";
import { contentBox } from "@/admin/images";

/** A width × height RGBA picture filled with `bg`, with `fg` drawn in the given rectangle. */
function picture(width: number, height: number, bg: number[], fg: number[], rect?: { x: number; y: number; w: number; h: number }) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside = rect && x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
      data.set(inside ? fg : bg, (y * width + x) * 4);
    }
  }
  return data;
}

describe("contentBox", () => {
  it("cuts see-through margins down to the drawn part", () => {
    const data = picture(40, 20, [0, 0, 0, 0], [20, 30, 40, 255], { x: 5, y: 3, w: 30, h: 12 });
    expect(contentBox(data, 40, 20)).toEqual({ x: 5, y: 3, width: 30, height: 12 });
  });

  it("cuts a plain white background, allowing for JPEG noise", () => {
    const data = picture(30, 30, [255, 255, 255, 255], [200, 60, 20, 255], { x: 10, y: 8, w: 6, h: 14 });
    data.set([240, 246, 250, 255], 0); // a slightly off-white corner pixel
    expect(contentBox(data, 30, 30)).toEqual({ x: 10, y: 8, width: 6, height: 14 });
  });

  it("keeps the whole picture when it fills the frame", () => {
    const data = picture(10, 10, [255, 255, 255, 255], [0, 0, 0, 255], { x: 0, y: 0, w: 10, h: 10 });
    data.set([255, 0, 0, 255], 0);
    expect(contentBox(data, 10, 10)).toEqual({ x: 0, y: 0, width: 10, height: 10 });
  });

  it("returns null for an empty picture", () => {
    expect(contentBox(picture(8, 8, [0, 0, 0, 0], [0, 0, 0, 0]), 8, 8)).toBeNull();
    expect(contentBox(picture(8, 8, [255, 255, 255, 255], [0, 0, 0, 0]), 8, 8)).toBeNull();
  });
});
