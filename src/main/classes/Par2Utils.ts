// -----------------------------
// Helpers
// -----------------------------

/**
 * Parse Nyuu-style sizes like "700K", "1M", "2m", "500k"
 * Returns number of bytes.
 */
export function parseNyuuSize(input: string): number {
    const match = input
        .trim()
        .toUpperCase()
        .match(/^(\d+(?:\.\d+)?)([KM]?)$/)
    if (!match) throw new Error('Invalid article size format: ' + input)

    const value = parseFloat(match[1])
    const unit = match[2]

    switch (unit) {
        case 'K':
            return Math.round(value * 1024)
        case 'M':
            return Math.round(value * 1024 * 1024)
        default:
            return Math.round(value) // bytes
    }
}

/**
 * Round the slice size to nearest valid power-of-two style block.
 * Typical PAR2-friendly increments.
 */
export function nearestSliceBucket(bytes: number): number {
    const buckets = [
        64 * 1024,
        128 * 1024,
        256 * 1024,
        512 * 1024,
        1 * 1024 * 1024,
        2 * 1024 * 1024,
        4 * 1024 * 1024,
        8 * 1024 * 1024
    ]

    let closest = buckets[0]
    let bestDiff = Math.abs(bytes - closest)

    for (const b of buckets) {
        const diff = Math.abs(bytes - b)
        if (diff < bestDiff) {
            closest = b
            bestDiff = diff
        }
    }
    return closest
}

/**
 * Snap the slice size to a multiple of article size.
 */
export function alignToArticleSize(slice: number, article: number): number {
    return Math.ceil(slice / article) * article
}

// -----------------------------
// Main function
// -----------------------------

export function computePar2Parameters(
    totalBytes: number,
    articleSizeStr: string = '700K'
): { sliceSize: string; redundancy: string } {
    const articleSize = parseNyuuSize(articleSizeStr)

    // ----- Determine tier -----
    let targetSlices: number
    let redundancy: number

    if (totalBytes < 2n * 1024n * 1024n * 1024n) {
        targetSlices = 8000
        redundancy = 18
    } else if (totalBytes < 10n * 1024n * 1024n * 1024n) {
        targetSlices = 15000
        redundancy = 12
    } else if (totalBytes < 50n * 1024n * 1024n * 1024n) {
        targetSlices = 20000
        redundancy = 10
    } else if (totalBytes < 200n * 1024n * 1024n * 1024n) {
        targetSlices = 25000
        redundancy = 7
    } else if (totalBytes < 500n * 1024n * 1024n * 1024n) {
        targetSlices = 20000
        redundancy = 5
    } else {
        targetSlices = 18000
        redundancy = 2
    }

    // ----- Compute raw target slice size -----
    const rawSlice = Number(BigInt(totalBytes) / BigInt(targetSlices))

    // Round to power-of-two friendly bucket
    let sliceSize = nearestSliceBucket(rawSlice)

    // Align slice size to article size
    sliceSize = alignToArticleSize(sliceSize, articleSize)

    return {
        sliceSize: `${sliceSize}b`,
        redundancy: `${redundancy}%`
    }
}
