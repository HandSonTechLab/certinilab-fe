import {PageInfoModel} from './page-info.model';
import {SupplierModel} from './supplier.model';

export interface SupplierResponse {
  supplierEntities: Array<SupplierModel>,
  pageInfo: PageInfoModel
}
