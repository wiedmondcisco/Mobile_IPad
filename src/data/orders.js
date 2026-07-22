import { Search } from "lucide-react";

export const orders = [
  {id:"SO-105488", pe:"PE3", status:"Full Revenue", customer:"GlobalNet Inc",      partner:"Direct",           bookings:"$9,600",  backlog:"$0",      revenue:"$9,600"},
  {id:"SO-105310", pe:"PE2", status:"Full Revenue", customer:"BlueStar Solutions", partner:"Insight Enterpr.", bookings:"$17,800", backlog:"$0",      revenue:"$17,800"},
  {id:"SO-105188", pe:"PE1", status:"Full Revenue", customer:"Vertex Dynamics",    partner:"SHI Internat.",    bookings:"$14,500", backlog:"$0",      revenue:"$14,500"},
  {id:"SO-105078", pe:"PE1", status:"Partial",      customer:"Helix Networks",     partner:"CDW Corp.",        bookings:"$21,000", backlog:"$14,000", revenue:"$7,000"},
  {id:"SO-104821", pe:"PE1", status:"Full Revenue", customer:"Acme Corp",          partner:"Direct",           bookings:"$12,500", backlog:"$0",      revenue:"$12,500"},
  {id:"SO-104650", pe:"PE1", status:"Backlog",      customer:"Cortex Financial",   partner:"Direct",           bookings:"$23,000", backlog:"$23,000", revenue:"$0"},
  {id:"SO-104512", pe:"PE3", status:"Full Revenue", customer:"Summit Digital",     partner:"CDW Corp.",        bookings:"$8,850",  backlog:"$0",      revenue:"$8,850"},
  /* Orders behind the Payments "Revenue Transactions" popups — every SO
     shown there resolves to one of these (deep-linked via Order Search) */
  {id:"SO-105201", pe:"PE1", status:"Full Revenue", customer:"Meridian Corp",       partner:"Direct",           bookings:"$5,800",  backlog:"$0", revenue:"$5,800"},
  {id:"SO-105189", pe:"PE1", status:"Full Revenue", customer:"Apex Healthcare",     partner:"CDW Corp.",        bookings:"$4,450",  backlog:"$0", revenue:"$4,450"},
  {id:"SO-104998", pe:"PE1", status:"Full Revenue", customer:"NovaTech Inc",        partner:"Insight Enterpr.", bookings:"$3,850",  backlog:"$0", revenue:"$3,850"},
  {id:"SO-104890", pe:"PE1", status:"Full Revenue", customer:"Pinnacle Group",      partner:"Direct",           bookings:"$2,875",  backlog:"$0", revenue:"$2,875"},
  {id:"SO-104780", pe:"PE1", status:"Full Revenue", customer:"Atlas Manufacturing", partner:"SHI Internat.",    bookings:"$3,230",  backlog:"$0", revenue:"$3,230"},
  {id:"SO-104670", pe:"PE1", status:"Full Revenue", customer:"Cortex Financial",    partner:"Direct",           bookings:"$2,320",  backlog:"$0", revenue:"$2,320"},
  {id:"SO-104550", pe:"PE1", status:"Full Revenue", customer:"Summit Logistics",    partner:"CDW Corp.",        bookings:"$2,180",  backlog:"$0", revenue:"$2,180"},
  {id:"SO-104402", pe:"PE1", status:"Full Revenue", customer:"Ironwood Retail",     partner:"Direct",           bookings:"$1,295",  backlog:"$0", revenue:"$1,295"},
  {id:"SO-105144", pe:"PE2", status:"Full Revenue", customer:"ClearPath Systems",   partner:"Direct",           bookings:"$18,500", backlog:"$0", revenue:"$18,500"},
  {id:"SO-105044", pe:"PE2", status:"Full Revenue", customer:"Quantum Analytics",   partner:"Insight Enterpr.", bookings:"$12,000", backlog:"$0", revenue:"$12,000"},
  {id:"SO-104515", pe:"PE2", status:"Full Revenue", customer:"BlueStar Solutions",  partner:"Insight Enterpr.", bookings:"$15,500", backlog:"$0", revenue:"$15,500"},
  {id:"SO-104089", pe:"PE2", status:"Full Revenue", customer:"Vector Systems",      partner:"Direct",           bookings:"$16,000", backlog:"$0", revenue:"$16,000"},
  {id:"SO-105112", pe:"PE3", status:"Full Revenue", customer:"Summit Digital",      partner:"CDW Corp.",        bookings:"$15,000", backlog:"$0", revenue:"$15,000"},
  {id:"SO-104876", pe:"PE3", status:"Full Revenue", customer:"Orion Networks",      partner:"Direct",           bookings:"$14,500", backlog:"$0", revenue:"$14,500"},
  {id:"SO-104655", pe:"PE3", status:"Full Revenue", customer:"Phoenix Labs",        partner:"SHI Internat.",    bookings:"$10,500", backlog:"$0", revenue:"$10,500"},
  {id:"SO-104733", pe:"PE1", status:"Full Revenue", customer:"Helix Networks",      partner:"CDW Corp.",        bookings:"$1,800",  backlog:"$0", revenue:"$1,800"},
  {id:"SO-104489", pe:"PE1", status:"Full Revenue", customer:"Vertex Dynamics",     partner:"SHI Internat.",    bookings:"$1,200",  backlog:"$0", revenue:"$1,200"},
  {id:"SO-104702", pe:"PE1", status:"Full Revenue", customer:"BlueStar Solutions",  partner:"Insight Enterpr.", bookings:"$1,400",  backlog:"$0", revenue:"$1,400"},
  {id:"SO-104481", pe:"PE1", status:"Full Revenue", customer:"Acme Corp",           partner:"Direct",           bookings:"$1,000",  backlog:"$0", revenue:"$1,000"},
  {id:"SO-104615", pe:"PE3", status:"Full Revenue", customer:"GlobalNet Inc",       partner:"Direct",           bookings:"$1,900",  backlog:"$0", revenue:"$1,900"}
];

export const ORDER_STATUSES = ["All Statuses", "Backlog", "Full Revenue", "Partial"];

export const ORDER_PES = ["All Plan Elements", "PE1 - Prod+Services", "PE2 - Recurring Software", "PE3 - Services"];

/* Order Search — searchable field types (from the desktop reference).
   Demo data only carries SO number / customer / partner, so each type maps
   to its closest field; unmapped types search across all of them. */

export const ORDER_SEARCH_TYPES = ["SO Number", "Deal ID", "PO Number", "Subscription Reference ID", "Book Date Range", "End Customer", "Account Name (UCD C4)", "Account ID (UCD C4)"];

export const ORDER_TYPE_FIELDS = {"SO Number":["id"], "End Customer":["customer"], "Account Name (UCD C4)":["customer","partner"], "Account ID (UCD C4)":["customer","partner"]};

/* Revenue Transactions — shown by the note icon on Payments rows (per plan
   element / uplift component). Every SO here is an actual order in `orders`,
   so the popup can deep-link into Order Search for full order details. */

export const revenueTxns = {
  PE1:{total:"26,000.00", rows:[
    {so:"SO-105201", date:"May 12, 2026", customer:"Meridian Corp",       rev:"$5,800.00"},
    {so:"SO-105189", date:"May 8, 2026",  customer:"Apex Healthcare",     rev:"$4,450.00"},
    {so:"SO-104998", date:"Apr 28, 2026", customer:"NovaTech Inc",        rev:"$3,850.00"},
    {so:"SO-104890", date:"Apr 20, 2026", customer:"Pinnacle Group",      rev:"$2,875.00"},
    {so:"SO-104780", date:"Apr 14, 2026", customer:"Atlas Manufacturing", rev:"$3,230.00"},
    {so:"SO-104670", date:"Apr 5, 2026",  customer:"Cortex Financial",    rev:"$2,320.00"},
    {so:"SO-104550", date:"Mar 22, 2026", customer:"Summit Logistics",    rev:"$2,180.00"},
    {so:"SO-104402", date:"Mar 2, 2026",  customer:"Ironwood Retail",     rev:"$1,295.00"}
  ]},
  PE2:{total:"62,000.00", rows:[
    {so:"SO-105144", date:"Apr 22, 2026", customer:"ClearPath Systems",  rev:"$18,500.00"},
    {so:"SO-105044", date:"Apr 7, 2026",  customer:"Quantum Analytics",  rev:"$12,000.00"},
    {so:"SO-104515", date:"Mar 8, 2026",  customer:"BlueStar Solutions", rev:"$15,500.00"},
    {so:"SO-104089", date:"Feb 22, 2026", customer:"Vector Systems",     rev:"$16,000.00"}
  ]},
  PE3:{total:"40,000.00", rows:[
    {so:"SO-105112", date:"Apr 15, 2026", customer:"Summit Digital", rev:"$15,000.00"},
    {so:"SO-104876", date:"Mar 20, 2026", customer:"Orion Networks", rev:"$14,500.00"},
    {so:"SO-104655", date:"Mar 1, 2026",  customer:"Phoenix Labs",   rev:"$10,500.00"}
  ]},
  /* PE1 breakdown components (keyed via each child's txnKey) */
  CUSEC:{total:"3,000.00", rows:[
    {so:"SO-104733", date:"Apr 11, 2026", customer:"Helix Networks",  rev:"$1,800.00"},
    {so:"SO-104489", date:"Mar 15, 2026", customer:"Vertex Dynamics", rev:"$1,200.00"}
  ]},
  CUCOLLAB:{total:"2,400.00", rows:[
    {so:"SO-104702", date:"Apr 9, 2026",  customer:"BlueStar Solutions", rev:"$1,400.00"},
    {so:"SO-104481", date:"Mar 14, 2026", customer:"Acme Corp",          rev:"$1,000.00"}
  ]},
  MY:{total:"1,900.00", rows:[
    {so:"SO-104615", date:"Mar 28, 2026", customer:"GlobalNet Inc", rev:"$1,900.00"}
  ]}
};

/* Payment Breakdown donut slices — validated categorical palette in fixed
   CVD-safe order (blue, aqua, yellow, green, violet, red), with per-theme
   steps so each hue clears the card surface it actually renders on. The
   legend rows carry every slice's label + value, covering the two light-mode
   hues that sit under 3:1 contrast. */
/* Cisco brand scheme: Medium Blue, Sky Blue, Orange, Red, Green, plus a
   Midnight tint for the sixth slice (dark theme uses brighter tints). */

export function deriveOrders(query, type, status="All Statuses", pe="All Plan Elements") {
  const q = query.trim().toLowerCase();
  const fields = ORDER_TYPE_FIELDS[type] || ["id", "customer", "partner"];
  let list = q ? orders.filter(o => {
    /* Deal/PO ids are derived per-order (orderDetailMeta), not stored fields */
    if (type === "Deal ID" || type === "PO Number") {
      const m = orderDetailMeta(o);
      return (type === "Deal ID" ? m.deal : m.po).toLowerCase().includes(q);
    }
    return fields.some(f => o[f].toLowerCase().includes(q));
  }) : orders;
  if (status !== "All Statuses") list = list.filter(o => o.status === status);
  if (pe !== "All Plan Elements") list = list.filter(o => o.pe === pe.slice(0, 3));
  return {q, list};
}


export const ORDER_PE_LABEL = {PE1:"Prod+Services", PE2:"Recurring Software", PE3:"Services"};

export function orderDetailMeta(o) {
  const digits = o.id.replace(/\D/g, "");
  const num = parseInt(digits, 10);
  const txn = Object.values(revenueTxns).flatMap(t=>t.rows).find(r=>r.so===o.id);
  return {
    webId: "WEB-" + digits,
    po: "PO-" + (60000 + (num % 9000)),
    deal: "DL-" + (9900000 + ((num * 7) % 99999)),
    booked: txn ? txn.date : `${["Mar","Apr","May"][num % 3]} ${(num % 27) + 1}, 2026`
  };
}
