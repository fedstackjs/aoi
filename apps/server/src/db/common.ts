import { BSON } from 'mongodb'

export interface IPrincipalAssociation {
  principalId: BSON.UUID
  capability: BSON.Long
}

export interface IPrincipalControlable {
  associations: IPrincipalAssociation[]
}
