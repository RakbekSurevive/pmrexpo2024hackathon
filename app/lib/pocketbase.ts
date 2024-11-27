import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://hackathon24.pockethost.io'); 
pb.autoCancellation(false);