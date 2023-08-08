import { OpenmrsObject } from './OpenmrsObject'
import { Auditable } from './Auditable'
import { Voidable } from './Voidable'

export interface OpenmrsData extends OpenmrsObject, Auditable, Voidable {
}

