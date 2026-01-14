import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

/**
 * Supabase Storage에 이미지 업로드
 * @param client Supabase 클라이언트
 * @param file 업로드할 파일
 * @param storageFolder UUID (products/{uuid})
 * @param folder 'images' 또는 'descriptions'
 * @param fileName 파일명 (예: 'main.jpg', 'additional_1.jpg')
 * @returns 업로드된 파일의 공개 URL
 */
export const uploadProductImage = async (
  client: SupabaseClient<Database>,
  file: File,
  storageFolder: string,
  folder: "images" | "descriptions",
  fileName: string
): Promise<string> => {
  const filePath = `products/${storageFolder}/${folder}/${fileName}`;

  const { error: uploadError } = await client.storage
    .from("products")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // 같은 이름이면 덮어쓰기
    });

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }

  // 공개 URL 가져오기
  const {
    data: { publicUrl },
  } = client.storage.from("products").getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Supabase Storage에서 이미지 삭제
 * @param client Supabase 클라이언트
 * @param storageFolder UUID
 * @param folder 'images' 또는 'descriptions'
 * @param fileName 파일명
 */
export const deleteProductImage = async (
  client: SupabaseClient<Database>,
  storageFolder: string,
  folder: "images" | "descriptions",
  fileName: string
): Promise<void> => {
  const filePath = `products/${storageFolder}/${folder}/${fileName}`;

  const { error } = await client.storage.from("products").remove([filePath]);

  if (error) {
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
};

/**
 * 파일 확장자 추출
 */
export const getFileExtension = (file: File): string => {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
};
