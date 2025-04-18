import type { RouteHint, Invoice } from '../lightning';
export declare enum LookupModifier {
    /** DEFAULT - The default look up modifier, no look up behavior is changed. */
    DEFAULT = "DEFAULT",
    /**
     * HTLC_SET_ONLY - Indicates that when a look up is done based on a set_id, then only that set
     * of HTLCs related to that set ID should be returned.
     */
    HTLC_SET_ONLY = "HTLC_SET_ONLY",
    /**
     * HTLC_SET_BLANK - Indicates that when a look up is done using a payment_addr, then no HTLCs
     * related to the payment_addr should be returned. This is useful when one
     * wants to be able to obtain the set of associated setIDs with a given
     * invoice, then look up the sub-invoices "projected" by that set ID.
     */
    HTLC_SET_BLANK = "HTLC_SET_BLANK",
    UNRECOGNIZED = "UNRECOGNIZED"
}
export interface CancelInvoiceMsg {
    /**
     * Hash corresponding to the (hold) invoice to cancel. When using
     * REST, this field must be encoded as base64.
     */
    paymentHash: Uint8Array | string;
}
export interface CancelInvoiceResp {
}
export interface AddHoldInvoiceRequest {
    /**
     * An optional memo to attach along with the invoice. Used for record keeping
     * purposes for the invoice's creator, and will also be set in the description
     * field of the encoded payment request if the description_hash field is not
     * being used.
     */
    memo: string;
    /** The hash of the preimage */
    hash: Uint8Array | string;
    /**
     * The value of this invoice in satoshis
     *
     * The fields value and value_msat are mutually exclusive.
     */
    value: string;
    /**
     * The value of this invoice in millisatoshis
     *
     * The fields value and value_msat are mutually exclusive.
     */
    valueMsat: string;
    /**
     * Hash (SHA-256) of a description of the payment. Used if the description of
     * payment (memo) is too long to naturally fit within the description field
     * of an encoded payment request.
     */
    descriptionHash: Uint8Array | string;
    /** Payment request expiry time in seconds. Default is 86400 (24 hours). */
    expiry: string;
    /** Fallback on-chain address. */
    fallbackAddr: string;
    /** Delta to use for the time-lock of the CLTV extended to the final hop. */
    cltvExpiry: string;
    /**
     * Route hints that can each be individually used to assist in reaching the
     * invoice's destination.
     */
    routeHints: RouteHint[];
    /** Whether this invoice should include routing hints for private channels. */
    private: boolean;
}
export interface AddHoldInvoiceResp {
    /**
     * A bare-bones invoice for a payment within the Lightning Network. With the
     * details of the invoice, the sender has all the data necessary to send a
     * payment to the recipient.
     */
    paymentRequest: string;
    /**
     * The "add" index of this invoice. Each newly created invoice will increment
     * this index making it monotonically increasing. Callers to the
     * SubscribeInvoices call can use this to instantly get notified of all added
     * invoices with an add_index greater than this one.
     */
    addIndex: string;
    /**
     * The payment address of the generated invoice. This is also called
     * the payment secret in specifications (e.g. BOLT 11). This value should
     * be used in all payments for this invoice as we require it for end to end
     * security.
     */
    paymentAddr: Uint8Array | string;
}
export interface SettleInvoiceMsg {
    /**
     * Externally discovered pre-image that should be used to settle the hold
     * invoice.
     */
    preimage: Uint8Array | string;
}
export interface SettleInvoiceResp {
}
export interface SubscribeSingleInvoiceRequest {
    /**
     * Hash corresponding to the (hold) invoice to subscribe to. When using
     * REST, this field must be encoded as base64url.
     */
    rHash: Uint8Array | string;
}
export interface LookupInvoiceMsg {
    /** When using REST, this field must be encoded as base64. */
    paymentHash: Uint8Array | string | undefined;
    paymentAddr: Uint8Array | string | undefined;
    setId: Uint8Array | string | undefined;
    lookupModifier: LookupModifier;
}
/** CircuitKey is a unique identifier for an HTLC. */
export interface CircuitKey {
    /** The id of the channel that the is part of this circuit. */
    chanId: string;
    /** The index of the incoming htlc in the incoming channel. */
    htlcId: string;
}
export interface HtlcModifyRequest {
    /**
     * The invoice the intercepted HTLC is attempting to settle. The HTLCs in
     * the invoice are only HTLCs that have already been accepted or settled,
     * not including the current intercepted HTLC.
     */
    invoice: Invoice | undefined;
    /** The unique identifier of the HTLC of this intercepted HTLC. */
    exitHtlcCircuitKey: CircuitKey | undefined;
    /** The amount in milli-satoshi that the exit HTLC is attempting to pay. */
    exitHtlcAmt: string;
    /** The absolute expiry height of the exit HTLC. */
    exitHtlcExpiry: number;
    /** The current block height. */
    currentHeight: number;
    /** The wire message custom records of the exit HTLC. */
    exitHtlcWireCustomRecords: {
        [key: string]: Uint8Array | string;
    };
}
export interface HtlcModifyRequest_ExitHtlcWireCustomRecordsEntry {
    key: string;
    value: Uint8Array | string;
}
export interface HtlcModifyResponse {
    /** The circuit key of the HTLC that the client wants to modify. */
    circuitKey: CircuitKey | undefined;
    /**
     * The modified amount in milli-satoshi that the exit HTLC is paying. This
     * value can be different from the actual on-chain HTLC amount, in case the
     * HTLC carries other valuable items, as can be the case with custom channel
     * types.
     */
    amtPaid?: string | undefined;
    /**
     * This flag indicates whether the HTLCs associated with the invoices should
     * be cancelled. The interceptor client may set this field if some
     * unexpected behavior is encountered. Setting this will ignore the amt_paid
     * field.
     */
    cancelSet: boolean;
}
/**
 * Invoices is a service that can be used to create, accept, settle and cancel
 * invoices.
 */
export interface Invoices {
    /**
     * SubscribeSingleInvoice returns a uni-directional stream (server -> client)
     * to notify the client of state transitions of the specified invoice.
     * Initially the current invoice state is always sent out.
     */
    subscribeSingleInvoice(request?: DeepPartial<SubscribeSingleInvoiceRequest>, onMessage?: (msg: Invoice) => void, onError?: (err: Error) => void): void;
    /**
     * lncli: `cancelinvoice`
     * CancelInvoice cancels a currently open invoice. If the invoice is already
     * canceled, this call will succeed. If the invoice is already settled, it will
     * fail.
     */
    cancelInvoice(request?: DeepPartial<CancelInvoiceMsg>): Promise<CancelInvoiceResp>;
    /**
     * lncli: `addholdinvoice`
     * AddHoldInvoice creates a hold invoice. It ties the invoice to the hash
     * supplied in the request.
     */
    addHoldInvoice(request?: DeepPartial<AddHoldInvoiceRequest>): Promise<AddHoldInvoiceResp>;
    /**
     * lncli: `settleinvoice`
     * SettleInvoice settles an accepted invoice. If the invoice is already
     * settled, this call will succeed.
     */
    settleInvoice(request?: DeepPartial<SettleInvoiceMsg>): Promise<SettleInvoiceResp>;
    /**
     * LookupInvoiceV2 attempts to look up at invoice. An invoice can be referenced
     * using either its payment hash, payment address, or set ID.
     */
    lookupInvoiceV2(request?: DeepPartial<LookupInvoiceMsg>): Promise<Invoice>;
    /**
     * HtlcModifier is a bidirectional streaming RPC that allows a client to
     * intercept and modify the HTLCs that attempt to settle the given invoice. The
     * server will send HTLCs of invoices to the client and the client can modify
     * some aspects of the HTLC in order to pass the invoice acceptance tests.
     */
    htlcModifier(request?: DeepPartial<HtlcModifyResponse>, onMessage?: (msg: HtlcModifyRequest) => void, onError?: (err: Error) => void): void;
}
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
//# sourceMappingURL=invoices.d.ts.map