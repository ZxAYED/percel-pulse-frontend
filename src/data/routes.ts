export type LatLngTuple = [number, number];

export const agentRoutePlan = {
  label: "Agent delivery route",
  startOptions: [
    { id: "central", label: "Central Hub", coords: [23.8103, 90.4125] as LatLngTuple },
    { id: "uttara", label: "Uttara Hub", coords: [23.8721, 90.4000] as LatLngTuple },
    { id: "banani", label: "Banani Depot", coords: [23.7936, 90.4043] as LatLngTuple },
  ],
  waypoints: [
    [23.7800, 90.4200],
    [23.7600, 90.4100],
    [23.7350, 90.3980],
  ] as LatLngTuple[],
};

export const customerRoutePlan = {
  label: "Customer route",
  start: [23.7500, 90.3900] as LatLngTuple,
  waypoints: [
    [23.7550, 90.4050],
    [23.7680, 90.4180],
    [23.7820, 90.4300],
  ] as LatLngTuple[],
};

export const adminRoutePlan = {
  label: "Operations route",
  start: [23.8200, 90.4280] as LatLngTuple,
  waypoints: [
    [23.8000, 90.4180],
    [23.7800, 90.4080],
    [23.7600, 90.3980],
  ] as LatLngTuple[],
};
