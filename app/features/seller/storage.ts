import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

/**
 * Supabase Storage에 판매자 로고 업로드
 * @param client Supabase 클라이언트 (browserClient)
 * @param file 업로드할 파일
 * @param sellerCode 판매자 코드 (e.g. 'SL0001')
 * @returns 업로드된 파일의 공개 URL
 */
export const uploadSellerLogo = async (
  client: SupabaseClient<Database>,
  file: File,
  sellerCode: string,
): Promise<string> => {
  const filePath = `${sellerCode}/logo`;

  const { error: uploadError } = await client.storage
    .from("sellers")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`로고 업로드 실패: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from("sellers").getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Supabase Storage에서 판매자 로고 삭제
 * @param client Supabase 클라이언트
 * @param sellerCode 판매자 코드
 */
export const deleteSellerLogo = async (
  client: SupabaseClient<Database>,
  sellerCode: string,
): Promise<void> => {
  const filePath = `${sellerCode}/logo`;

  const { error } = await client.storage.from("sellers").remove([filePath]);
  if (error) {
    throw new Error(`로고 삭제 실패: ${error.message}`);
  }
};

/**
 * 판매자 로고 공개 URL 가져오기
 * @param client Supabase 클라이언트
 * @param sellerCode 판매자 코드
 * @returns 공개 URL
 */
export const getSellerLogoUrl = (
  client: SupabaseClient<Database>,
  sellerCode: string,
): string => {
  const filePath = `${sellerCode}/logo`;
  const {
    data: { publicUrl },
  } = client.storage.from("sellers").getPublicUrl(filePath);
  return publicUrl;
};
