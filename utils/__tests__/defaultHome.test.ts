import {
  buildDefaultHomeModel,
  DEFAULT_HOME_COPY,
  getRenderableHomeSections,
  shouldUseDefaultHome,
  type HomeLayoutItem,
} from "@/utils/defaultHome";

const product = (
  productId: string,
  title: string,
  extras: { images?: string[]; price?: number | null } = {}
) => ({
  productId,
  title,
  price: extras.price === null ? undefined : extras.price ?? 12,
  images: extras.images,
});

const collection = (
  id: string,
  title: string,
  extras: { image?: string; products?: ReturnType<typeof product>[] } = {}
) => ({
  id,
  title,
  image: extras.image,
  products: extras.products,
});

describe("getRenderableHomeSections", () => {
  it("treats a missing or empty layout with no section data as unrenderable", () => {
    expect(shouldUseDefaultHome(undefined)).toBe(true);
    expect(shouldUseDefaultHome(null)).toBe(true);
    expect(shouldUseDefaultHome({})).toBe(true);
    expect(shouldUseDefaultHome({ layout: [] })).toBe(true);
    expect(getRenderableHomeSections({})).toEqual([]);
  });

  it("keeps the default section order when layout is absent but a section has items", () => {
    const sections = getRenderableHomeSections({
      layout: [],
      categoryGrid: [{ id: "1", title: "Kitchen" }],
    } as never);

    expect(sections.map((section) => section.type)).toEqual(["category_grid"]);
    expect(shouldUseDefaultHome({ categoryGrid: [{ id: "1" }] } as never)).toBe(
      false
    );
  });

  it("renders only visible published modules that have items", () => {
    const layout: HomeLayoutItem[] = [
      { type: "carousel", position: 0, isVisible: true },
      { type: "category_grid", position: 1, isVisible: false },
      { type: "promo_banners", position: 2, isVisible: true },
    ];

    const sections = getRenderableHomeSections({
      layout,
      carousel: [{ id: "banner" }],
      categoryGrid: [{ id: "hidden-but-populated" }],
      promoBanners: [],
    } as never);

    expect(sections).toEqual([layout[0]]);
    expect(shouldUseDefaultHome({ layout, carousel: [{ id: "banner" }] } as never)).toBe(
      false
    );
  });

  it("uses the smart default when a published layout's visible modules are empty", () => {
    const data = {
      layout: [{ type: "carousel", position: 0, isVisible: true }],
      carousel: [],
      categoryGrid: [{ id: "not-in-layout" }],
    };

    expect(getRenderableHomeSections(data as never)).toEqual([]);
    expect(shouldUseDefaultHome(data as never)).toBe(true);
  });

  it("ignores unknown layout types instead of throwing", () => {
    const data = {
      layout: [
        { type: "not_a_module", position: 0, isVisible: true },
        { type: "carousel", position: 1, isVisible: true },
      ],
      carousel: [{ id: "banner" }],
    };

    expect(getRenderableHomeSections(data as never)).toEqual([
      { type: "carousel", position: 1, isVisible: true },
    ]);
  });
});

describe("buildDefaultHomeModel", () => {
  it("returns null when the catalog has nothing displayable", () => {
    expect(
      buildDefaultHomeModel({
        storeName: "Northwind",
        products: [],
        collections: [],
      })
    ).toBeNull();

    expect(
      buildDefaultHomeModel({
        products: [{ productId: "", title: "Missing id", price: 1 }],
        collections: [{ id: "1", title: "   " }],
      })
    ).toBeNull();
  });

  it("uses the store name, a collection hero, and featured products", () => {
    const model = buildDefaultHomeModel({
      storeName: "  Northwind Goods  ",
      products: [
        product("p1", "Ceramic Pour-Over", {
          images: ["https://cdn.example/pour-over.jpg"],
        }),
        product("p1", "Duplicate", { images: ["https://cdn.example/dup.jpg"] }),
        product("p2", "No Photo"),
      ],
      collections: [
        collection("c1", "Kitchen", {
          image: "https://cdn.example/kitchen.jpg",
        }),
      ],
    });

    expect(model?.hero).toEqual({
      imageUrl: "https://cdn.example/kitchen.jpg",
      title: "Northwind Goods",
      subtitle: DEFAULT_HOME_COPY.heroSubtitle,
      action: { kind: "collection", id: "c1", title: "Kitchen" },
    });
    expect(model?.featuredProducts.map((item) => item.productId)).toEqual([
      "p1",
      "p2",
    ]);
    expect(model?.collections).toHaveLength(1);
  });

  it("falls back to a product hero and nested collection products", () => {
    const model = buildDefaultHomeModel({
      storeName: "   ",
      products: [] as ReturnType<typeof product>[],
      collections: [
        collection("c-plain", "Pantry"),
        collection("c-photo", "Table", {
          image: "",
          products: [
            product("nested", "Linen Napkin", {
              images: ["https://cdn.example/napkin.jpg"],
              price: 18,
            }),
            product("skip", "Priceless", { price: null }),
          ],
        }),
      ],
    });

    expect(model?.hero.title).toBe(DEFAULT_HOME_COPY.welcomeTitle);
    expect(model?.hero.imageUrl).toBe("https://cdn.example/napkin.jpg");
    expect(model?.hero.action).toEqual({ kind: "product", id: "nested" });
    expect(model?.featuredProducts.map((item) => item.title)).toEqual([
      "Linen Napkin",
    ]);
    expect(model?.collections.map((item) => item.id)).toEqual([
      "c-plain",
      "c-photo",
    ]);
  });

  it("caps featured products and collections", () => {
    const model = buildDefaultHomeModel({
      storeName: "Acme",
      products: Array.from({ length: 10 }, (_, index) =>
        product(`p${index}`, `Product ${index}`, {
          images: [`https://cdn.example/${index}.jpg`],
        })
      ),
      collections: Array.from({ length: 8 }, (_, index) =>
        collection(`c${index}`, `Collection ${index}`, {
          image: `https://cdn.example/c${index}.jpg`,
        })
      ),
    });

    expect(model?.featuredProducts).toHaveLength(8);
    expect(model?.collections).toHaveLength(6);
  });

  it("prefers products that have images without dropping the rest of the row", () => {
    const model = buildDefaultHomeModel({
      products: [
        product("plain", "Plain"),
        product("photo", "Photo", { images: ["https://cdn.example/photo.jpg"] }),
      ],
      collections: [],
    });

    expect(model?.featuredProducts.map((item) => item.productId)).toEqual([
      "photo",
      "plain",
    ]);
    expect(model?.hero.action).toEqual({ kind: "product", id: "photo" });
  });
});
