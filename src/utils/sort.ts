export function byNewestDate<T extends { data: { date: Date } }>(a: T, b: T) {
	return b.data.date.getTime() - a.data.date.getTime();
}
