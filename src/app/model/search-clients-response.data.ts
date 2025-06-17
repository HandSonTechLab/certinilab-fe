import {ClientDtoModel} from './client-dto.model';
import {PageInfoModel} from './page-info.model';

export interface SearchClientsResponse {
  ricercaClientiDtoList: Array<ClientDtoModel>,
  pageInfo: PageInfoModel
}
