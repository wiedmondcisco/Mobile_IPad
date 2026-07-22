/* User directory for Switch User (demo). Searchable by name, CEC ID, or
   employee ID; the first entry is the default signed-in seller. */
export const USERS = [
  {name:"Alex Johnson",    id:"527914", cec:"alejohns", role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/men/56.jpg"},
  {name:"Nassar, Mason C", id:"391847", cec:"mnassar",  role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/men/83.jpg"},
  {name:"Sarah Chen",      id:"745206", cec:"sarchen",  role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/women/79.jpg"},
  {name:"Lisa Kumar",      id:"618352", cec:"liskumar", role:"Commercial AE", avatar:"https://randomuser.me/api/portraits/women/25.jpg"},
  {name:"Mike Torres",     id:"284769", cec:"mictorre", role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/men/41.jpg"},
  {name:"Maya Chen",       id:"936125", cec:"maychen",  role:"Commercial AE", avatar:"https://randomuser.me/api/portraits/women/57.jpg"},
  {name:"Priya Shah",      id:"470583", cec:"prishah",  role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/women/90.jpg"},
];

/* "Nassar, Mason C" → "Mason"; "Alex Johnson" → "Alex" */
export const firstName = u => u.name.includes(",")
  ? u.name.split(",")[1].trim().split(" ")[0]
  : u.name.split(" ")[0];
