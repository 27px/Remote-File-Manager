type sortBy = "name" | "size" | "date" | "type";
type order = "asc" | "desc";
export default class sortType
{
  "key": sortBy;
  "type": order;
  constructor(k:sortBy,t:order)
  {
    this.key=k || "type";
    this.type=t || "asc";
  }
}
