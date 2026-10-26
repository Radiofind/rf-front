import { ErrorTypeEnum } from '../../core/enums/error-type.enum';

import type { ErrorType } from '../../core/types/error-type.type';
import type { IErrorContent } from '../models/error-content.model';

export const ERROR_PAGE_CONTENT: Readonly<Record<ErrorType, IErrorContent>> = {
  [ErrorTypeEnum.NOT_FOUND]: {
    code: '404',
    title: 'errorPage.notFoundTitle',
    titleColor: 'errorPage.notFoundAccent',
    description: 'errorPage.notFoundDescription',
    iconClass: 'bx bx-compass',
  },
  [ErrorTypeEnum.FORBIDDEN]: {
    code: '403',
    title: 'errorPage.forbiddenTitle',
    titleColor: 'errorPage.forbiddenAccent',
    description: 'errorPage.forbiddenDescription',
    iconClass: 'bx bx-lock-keyhole',
  },
  [ErrorTypeEnum.SERVER_ERROR]: {
    code: '500',
    title: 'errorPage.serverErrorTitle',
    titleColor: 'errorPage.serverErrorAccent',
    description: 'errorPage.serverErrorDescription',
    iconClass: 'bx bx-server',
  },
};
