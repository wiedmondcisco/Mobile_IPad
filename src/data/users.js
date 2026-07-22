/* User directory for Switch User (demo). Searchable by name, CEC ID, or
   employee ID; the first entry is the default signed-in seller. */
export const USERS = [
  {name:"Alex Johnson",    id:"148291", cec:"alejohns", role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/men/32.jpg"},
  {name:"Nassar, Mason C", id:"148740", cec:"mnassar",  role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/men/75.jpg"},
  {name:"Sarah Chen",      id:"151203", cec:"sarchen",  role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/women/44.jpg"},
  {name:"Lisa Kumar",      id:"149877", cec:"liskumar", role:"Commercial AE", avatar:"https://randomuser.me/api/portraits/women/68.jpg"},
  {name:"Mike Torres",     id:"150442", cec:"mictorre", role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/men/22.jpg"},
  {name:"Maya Chen",       id:"152011", cec:"maychen",  role:"Commercial AE", avatar:"https://randomuser.me/api/portraits/women/12.jpg"},
  {name:"Priya Shah",      id:"150989", cec:"prishah",  role:"Enterprise AE", avatar:"https://randomuser.me/api/portraits/women/33.jpg"},
];

/* "Nassar, Mason C" → "Mason"; "Alex Johnson" → "Alex" */
export const firstName = u => u.name.includes(",")
  ? u.name.split(",")[1].trim().split(" ")[0]
  : u.name.split(" ")[0];
