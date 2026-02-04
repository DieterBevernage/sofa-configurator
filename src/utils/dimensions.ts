import { getProduct } from '../config/products';
import type { BenchVariant } from '../types';

export const getModuleDimensions = (variant: string | BenchVariant) => {
    const product = getProduct(variant);
    if (!product) {
        // Fallback
        return { width: 1.5, depth: 0.5, height: 0.45 };
    }
    return {
        width: product.width,
        depth: product.depth,
        height: product.height
    };
};
