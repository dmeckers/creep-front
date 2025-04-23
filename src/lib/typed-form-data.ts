export class TypedFormData<K extends Record<string, any>> {
    private formData: FormData = new FormData();

    append(key: keyof K, value: string | Blob | File): void {
        this.formData.append(String(key), value);
    }

    toFormData(): FormData {
        return this.formData;
    }
}
