import { reviewSchema, type Review } from './schema'

/**
 * Invariant 6: reviews appear here only after the client confirms them with a
 * screenshot from the source. Nothing is written by us.
 */
export const reviews: Review[] = reviewSchema.array().parse([])
