export interface IAuthContent {
  title: string;
  titleColor: string;
  smile?: string;
  instructions: string;
  content: IContentEntity[];
};

export interface IContentEntity {
  id: string;
  iconClass: string;
  contentTitle: string;
  overview: string;
};