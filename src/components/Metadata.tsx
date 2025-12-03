import { Metadata } from "next";

type SEOProps = {
    title: string;
    brand?: string;
};

export function buildMetadata({ title, brand = "PharmaWallah" }: SEOProps): Metadata {
    return {
        title: `${title} | ${brand}`,
    };
}
