export type SubCategory = {
  id: number;
  code: string;
  name: string;
  mainCategoryId: number;
};

export type Category = {
  id: number;
  code: string;
  name: string;
  domainId: number;
  children: SubCategory[];
};

export type SystemOption = {
  id: number;
  code: string;
  name: string;
  domainId: number;
};
