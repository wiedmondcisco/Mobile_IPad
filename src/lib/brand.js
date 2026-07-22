export const PE_COLOR = { PE1:"#fbab2c", PE2:"#74bf4b", PE3:"#4f46e5", KSO:"#52719c", OTB:"#3e7bd6", NDR:"#00bceb" };

/* Unified PE chips (desktop reference): pastel fill + deep ink text.
   PE1 amber · PE2 green · PE3 purple — identical everywhere a PE1/2/3
   badge renders. Other ids (KSO, OTB, CU, MY, TI…) derive a tint. */
export const PE_BADGE = {
  PE1:{bg:"#fef3c7", fg:"#b45309"},
  PE2:{bg:"#dcfce7", fg:"#166534"},
  PE3:{bg:"#f3e8ff", fg:"#7e22ce"},
};
export const peBadgeStyle = (id, color) =>
  PE_BADGE[id] ? {background:PE_BADGE[id].bg, color:PE_BADGE[id].fg}
               : {background:(color || PE_COLOR[id] || "#52719c") + "22", color:color || PE_COLOR[id] || "#52719c"};
/* Selected goal-tab / estimator chips share the badge treatment + border */
export const peChipStyle = (id, color) => {
  const s = peBadgeStyle(id, color);
  return {...s, borderColor:s.color};
};

export const DONUT_LIGHT = ["#0051AF","#00BCEB","#FBAB2C","#E3241B","#74BF4B","#52719C"];

export const DONUT_DARK  = ["#3E7BD6","#33CDF0","#FFC155","#F0564D","#8FD86A","#7E9BC4"];
