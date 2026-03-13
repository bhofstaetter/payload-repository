type TransformerValue = any;

export const RepositorySupport = {
    applyTransformer: async (
        transformer: ((data: TransformerValue) => TransformerValue | Promise<TransformerValue>) | undefined,
        data: TransformerValue,
    ): Promise<TransformerValue> => {
        if (transformer) {
            return transformer(data);
        }

        return data;
    },
};
