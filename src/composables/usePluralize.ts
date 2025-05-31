export function usePluralize() {
    const pluralize = (count: number, singular: string, plural = `${singular}s`) => {
        return count === 1 ? singular : plural;
    }

    return { pluralize }
}