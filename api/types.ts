/**
 * Mobile-side view types layered over the Orval-generated API schemas.
 *
 * Everything in `api/generated/` is produced by `npm run generate:api` with
 * `clean: true`, so it must never be edited by hand — additions there are
 * deleted on the next regeneration. Types the app needs beyond what the
 * backend OpenAPI spec currently expresses live here instead.
 *
 * When the backend spec starts describing one of these shapes, regenerate the
 * client and replace the alias here with a re-export of the generated type.
 */
import type {
  CalloutBannerItemResponse,
  CalloutBannerItemResponseAction,
  CarouselItemResponse,
  CategoryCollectionGridResponse,
  CategoryGridItemResponse,
  CollectionDisplayResponse,
  CollectionShowcaseResponse,
  CollectionWithProducts,
  EnrichedProduct,
} from './generated/cartaisyAPI.schemas';

export type { PromoBannerItemResponse as PromoBannerItem } from './generated/cartaisyAPI.schemas';

/**
 * Product as rendered by the app. The backend spec marks `compareAtPrice` as
 * required on `EnrichedProduct`, but several endpoints omit it in practice.
 */
export type Product = Omit<EnrichedProduct, 'compareAtPrice'> & {
  compareAtPrice?: number;
};

/**
 * Response shape of `GET /customer/search`. The backend spec currently leaves
 * this endpoint untyped (empty response schema), so the generated client
 * returns `unknown`; consumers narrow to this type at the call site.
 */
export type SearchResponseData = {
  totalResults: number;
  products: EnrichedProduct[];
  collections: CollectionWithProducts[];
  query: string;
};

export interface SearchResponse {
  success: boolean;
  data: SearchResponseData;
}

export type CarouselItem = CarouselItemResponse;

export type CategoryGridItem = CategoryGridItemResponse & {
  id?: string | number;
};

export type CalloutBannerItemAction = CalloutBannerItemResponseAction & {
  collectionId?: string | number;
  navigateTo?: string;
};

export type CalloutBannerItem = Omit<CalloutBannerItemResponse, 'action'> & {
  action: CalloutBannerItemAction;
  position?: number;
};

/**
 * The backend spec types `CollectionDisplayResponse.collection` as `unknown`;
 * this is the shape the homescreen endpoint actually returns.
 */
export type CollectionDisplayCollection = {
  id: string;
  title: string;
  products: Product[];
};

export type CollectionDisplay = Omit<CollectionDisplayResponse, 'collection'> & {
  collection: CollectionDisplayCollection;
};

export type CategoryCollectionGridItem = CategoryCollectionGridResponse;

export type CollectionShowcaseItem = CollectionShowcaseResponse;
