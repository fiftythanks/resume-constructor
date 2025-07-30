export default function joinItems(items) {
  return items.map((item) => item.value).join(', ');
}
