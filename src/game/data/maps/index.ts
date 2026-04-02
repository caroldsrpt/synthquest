import type { GameMap } from '../types';
import { ECHO_VILLAGE } from './echoVillage';
import { ROUTE_1 } from './route1';

export const MAPS: Record<string, GameMap> = {
  echoVillage: ECHO_VILLAGE,
  route1: ROUTE_1,
};
