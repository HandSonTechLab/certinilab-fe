import {ClientDtoModel} from './client-dto.model';
import {PageInfoModel} from './page-info.model';

export interface SearchClientsResponse {
  searchClientsDtoList: Array<ClientDtoModel>,
  pageInfo: PageInfoModel
}
