import React from 'react';
import { Image } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { shapeOptions } from '../lib/rewrite';

export function Icon({ name, size = 18, color = '#242424' }) {
  const shapes = {
    arrow: <Path d="M4 12h15m-6-6 6 6-6 6" />,
    copy: <><Rect x="8" y="8" width="12" height="12" rx="2" /><Path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    sun: <><Circle cx="12" cy="12" r="4" /><Path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
    moon: <Path d="M20 15.4A8 8 0 0 1 8.6 4 8 8 0 1 0 20 15.4Z" />,
    history: <><Path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><Path d="M3 3v5h5m4-1v5l3 2" /></>,
    check: <><Circle cx="12" cy="12" r="9" /><Path d="m8 12 2.5 2.5L16 9" /></>,
    chevron: <Path d="m6 9 6 6 6-6" />,
    user: <><Circle cx="12" cy="8" r="3.5" /><Path d="M5.5 20c.5-3.5 2.8-5.5 6.5-5.5s6 2 6.5 5.5" /></>,
    signout: <><Path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /><Path d="M14 7l5 5-5 5m5-5H9" /></>,
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</Svg>;
}

export function RewriteMark({ size = 40, ink = '#242424', markInk = '#ffffff' }) {
  return <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="20" r="19" fill={ink} />
    <Path d="M12 15h14m-4-4 4 4-4 4M28 25H14m4 4-4-4 4-4" fill="none" stroke={markInk} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m29 8 .7 2.3L32 11l-2.3.7L29 14l-.7-2.3L26 11l2.3-.7L29 8Z" fill={markInk} />
  </Svg>;
}

export function RewriteRLogo({ size = 68 }) {
  return <Image source={require('../../assets/rewrite-logo.png')} resizeMode="contain" accessibilityRole="image" accessibilityLabel="Rewrite logo" style={{ width: size, height: size }} />;
}

const spikyPath = Array.from({ length: 48 }, (_, index) => {
  const angle = index * Math.PI / 24 - Math.PI / 2;
  const radius = index % 2 ? 17 : 22;
  return `${index ? 'L' : 'M'}${(24 + Math.cos(angle) * radius).toFixed(2)} ${(24 + Math.sin(angle) * radius).toFixed(2)}`;
}).join(' ') + 'Z';

export function Avatar({ variant = 0, size = 48 }) {
  const kind = typeof variant === 'number' ? shapeOptions[((variant % shapeOptions.length) + shapeOptions.length) % shapeOptions.length][0] : variant;
  const backgrounds = {
    clover: '#d9eee5', fork: '#e8e1fa', bloom: '#e0e5ff', petals: '#f9dcf5',
    asterisk: '#292a2b', rays: '#f06adf', burst: '#ffe2d8', flow: '#f77db6',
    dots: '#bdff2d', quad: '#fce2f8', split: '#ff7b00',
  };
  const art = {
    clover: <Path d="M24 22C18 10 9 8 6 14c-3 6 2 11 13 10C8 25 3 32 8 39c5 6 13 3 16-9 3 12 11 15 16 9 5-7 0-14-11-15 11 1 16-4 13-10-3-6-12-4-18 8Z" fill="#1b6758" />,
    fork: <Path d="M19 7h10v17l11 7-6 10-10-7-10 7-6-10 11-7V7Z" fill="#8069db" />,
    bloom: <G fill="#697aeb"><Circle cx="24" cy="24" r="16" />{Array.from({ length: 12 }, (_, index) => { const angle = index * Math.PI / 6; return <Circle key={index} cx={24 + Math.cos(angle) * 15} cy={24 + Math.sin(angle) * 15} r="5.6" />; })}</G>,
    petals: <G fill="#e46cdb">{[0, 90, 180, 270].map(angle => <Ellipse key={angle} cx="24" cy="13" rx="8.5" ry="13" transform={`rotate(${angle} 24 24)`} />)}</G>,
    asterisk: <G stroke="#fffdf4" strokeWidth={4.2} strokeLinecap="round"><Path d="M24 6v36M6 24h36M11 11l26 26M37 11 11 37" /></G>,
    rays: <G fill="#241824">{Array.from({ length: 12 }, (_, index) => <Path key={index} d="M24 21 20.5 5h7L24 21Z" transform={`rotate(${index * 30} 24 24)`} />)}</G>,
    burst: <Path d={spikyPath} fill="#ff4c28" />,
    flow: <><Path d="M4 22c5-8 11-9 16-5 4 3 5 4 8-2 3-5 8-6 11-3 4 4 1 10-5 10-5 0-7-2-11 1-7 5-14 5-19-1Zm14 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9Zm13 2c4-4 8-4 12-2-1 8-8 12-15 10-4-1-5-4-2-6 2-2 3-1 5-2Z" fill="#ff5d4c" /><Circle cx="37" cy="10" r="4" fill="#ff5d4c" /></>,
    dots: <G fill="#1b2421">{Array.from({ length: 81 }, (_, index) => { const x = 6 + index % 9 * 4.5; const y = 6 + Math.floor(index / 9) * 4.5; return Math.hypot(x - 24, y - 24) < 20 ? <Circle key={index} cx={x} cy={y} r=".9" /> : null; })}</G>,
    quad: <G fill="#f083e8"><Circle cx="15" cy="15" r="8.5" /><Circle cx="33" cy="15" r="8.5" /><Circle cx="15" cy="33" r="8.5" /><Circle cx="33" cy="33" r="8.5" /></G>,
    split: <Path d="M2 22h44v4H2Z" fill="#211c1b" />,
  }[kind];
  return <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r={kind === 'asterisk' ? 23.5 : 24} fill={backgrounds[kind]} stroke={kind === 'asterisk' ? '#555758' : 'none'} />
    <G transform="translate(3.84 3.84) scale(0.84)">{art}</G>
  </Svg>;
}

export function GoogleMark({ size = 20 }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.38-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.23c1.9-1.75 3-4.33 3-7.36Z" />
    <Path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.41l-3.23-2.52c-.9.6-2.05.96-3.41.96-2.62 0-4.83-1.77-5.62-4.15H3.05v2.6A10 10 0 0 0 12 22Z" />
    <Path fill="#FBBC05" d="M6.38 13.88A6 6 0 0 1 6.06 12c0-.65.12-1.28.32-1.88v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.48l3.33-2.6Z" />
    <Path fill="#EA4335" d="M12 5.97c1.48 0 2.8.51 3.85 1.52l2.89-2.89C16.98 2.97 14.7 2 12 2a10 10 0 0 0-8.95 5.52l3.33 2.6C7.17 7.74 9.38 5.97 12 5.97Z" />
  </Svg>;
}
