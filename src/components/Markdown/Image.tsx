import { ImageProps } from "next/image";
import { FC, useEffect, useState, memo } from "react";
import { ChatBlobStorage } from "@/utils/blobStorage";
export const Image: FC<ImageProps> = ({ ...props }) => {
    const [src, setSrc] = useState<string>();
    const memorizedFetchSrc = async (src: string) => {
        if (src.startsWith('https://') || src.startsWith('http://')) {
            return src;
        }
        const blobStorage = await ChatBlobStorage;
        if (await blobStorage.isBlobExist(src as string)) {
            const url = await blobStorage.getBlobUrl(src as string);
            return url;
        }
        else{
            return src;
        }
    }
    useEffect(() => {
        (async () => {
            const url = await memorizedFetchSrc(props.src as string);
            setSrc(url);
        })();
    }, []);

    return <img {...props} src={src} />;
}

function isImagePropsEqual(prevProps: ImageProps, nextProps: ImageProps) {
    return prevProps.src === nextProps.src;
}

export const MemorizedImage = memo(Image, isImagePropsEqual);

export const Anchor: FC<{href: string}> = ({ ...props }) => {
    const [href, setHref] = useState<string>();
    useEffect(() => {
        (async () => {
            // first, check if src starts with https:// or http://
            if (props.href.startsWith('https://') || props.href.startsWith('http://')) {
                setHref(props.href);
                return;
            }

            const blobStorage = await ChatBlobStorage;
            if (await blobStorage.isBlobExist(props.href as string)) {
                const url = await blobStorage.getBlobUrl(props.href as string);
                setHref(url);
            }
            else{
                setHref(props.href as string);
            }
        })();
    }
    , []);

    return <a {...props} href={href} />;
}
