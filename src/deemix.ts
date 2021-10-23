import deezer from 'deezer-js';
import deemix from 'deemix';
import path from 'path';

import { config } from './config';

export const deezerInstance = new deezer.Deezer();

export const format = deezer.TrackFormats[config.deemix.trackFormat || 'FLAC'];

export const deemixSettings = deemix.settings.DEFAULTS;
deemixSettings.downloadLocation = path.join(process.cwd(), 'data/');
deemixSettings.overwriteFile = deemix.settings.OverwriteOption.ONLY_TAGS;
deemixSettings.maxBitrate = String(format);
deemixSettings.tracknameTemplate = config.deemix.trackNameTemplate || deemixSettings.tracknameTemplate;
deemixSettings.albumTracknameTemplate = config.deemix.albumTrackNameTemplate || deemixSettings.albumTracknameTemplate;
deemixSettings.albumNameTemplate = config.deemix.albumNameTemplate || deemixSettings.createM3U8File;
deemixSettings.createM3U8File = config.deemix.createM3U8File !== undefined ? config.deemix.createM3U8File : deemixSettings.createM3U8File;
deemixSettings.embeddedArtworkPNG = config.deemix.embeddedArtworkPNG !== undefined ? config.deemix.embeddedArtworkPNG : deemixSettings.embeddedArtworkPNG;
deemixSettings.embeddedArtworkSize = config.deemix.embeddedArtworkSize || deemixSettings.embeddedArtworkSize;
deemixSettings.saveArtwork = config.deemix.saveArtwork !== undefined ? config.deemix.saveArtwork : deemixSettings.saveArtwork;
deemixSettings.localArtworkSize = deemixSettings.localArtworkSize || deemixSettings.localArtworkSize;
deemixSettings.localArtworkFormat = deemixSettings.localArtworkFormat || deemixSettings.localArtworkFormat;
deemixSettings.jpegImageQuality = deemixSettings.jpegImageQuality || deemixSettings.jpegImageQuality;
deemixSettings.removeDuplicateArtists = config.deemix.removeDuplicateArtists !== undefined ? config.deemix.removeDuplicateArtists : deemixSettings.removeDuplicateArtists;