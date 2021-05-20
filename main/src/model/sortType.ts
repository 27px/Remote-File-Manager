type sortBy = "name" | "size" | "date" | "type";
type order = "asc" | "desc";
export default class sortType
{
  "key": sortBy;
  "order": order;
  constructor(key:sortBy="type",order:order="asc")
  {
    this.key=key;
    this.order=order;
  }
}
