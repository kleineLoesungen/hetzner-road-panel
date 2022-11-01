export type TimelineSerie = {
  name: string;
  data: TimelineData[];
};

export type TimelineData = {
  id: string;
  x: string;
  y: [number, number];
  infos: TimelineDataInfos;
};

export type TimelineDataInfos = {
  type: string;
  label: string;
};
