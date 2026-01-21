export type SubCategory = {
  id: string;
  code: string;
  name: string;
  mainCategoryId: string;
};

export type Category = {
  id: string;
  code: string;
  name: string;
  domainId: string;
  children: SubCategory[];
};

export type SystemOption = {
  id: string;
  code: string;
  name: string;
  domainId: string;
};
