// ملف مولّد تلقائياً عبر scripts/gen-icons.mjs
import { Armchair, ArrowLeft, ArrowRight, Baby, BadgeCheck, Beef, Briefcase, Building2, Cake, CalendarCheck, CalendarDays, CalendarHeart, CalendarPlus, CalendarRange, CalendarSearch, Camera, Check, CheckCircle2, Cherry, ChevronLeft, ChevronRight, Circle, ClipboardList, Clock, Coffee, Coins, Compass, Crown, CupSoda, DoorOpen, Eye, Gem, Globe, GraduationCap, Hand, Heart, ImagePlus, Images, Inbox, Info, Layers, LayoutDashboard, LayoutGrid, Leaf, Link, ListChecks, Loader, Lock, LogOut, MailX, MapPin, MessageCircle, Moon, Package, PartyPopper, Pencil, Phone, Play, Plus, Radio, Receipt, RotateCcw, Route, ScanLine, Search, SearchX, Send, ShieldCheck, Sparkles, Speaker, Star, Store, Sun, Tent, Theater, Trash2, TrendingUp, Upload, UserCheck, UserPlus, Users, Wallet, Wheat, Zap } from "lucide-react";
import type { LucideProps } from "lucide-react";

const MAP = { Armchair, ArrowLeft, ArrowRight, Baby, BadgeCheck, Beef, Briefcase, Building2, Cake, CalendarCheck, CalendarDays, CalendarHeart, CalendarPlus, CalendarRange, CalendarSearch, Camera, Check, CheckCircle2, Cherry, ChevronLeft, ChevronRight, Circle, ClipboardList, Clock, Coffee, Coins, Compass, Crown, CupSoda, DoorOpen, Eye, Gem, Globe, GraduationCap, Hand, Heart, ImagePlus, Images, Inbox, Info, Layers, LayoutDashboard, LayoutGrid, Leaf, Link, ListChecks, Loader, Lock, LogOut, MailX, MapPin, MessageCircle, Moon, Package, PartyPopper, Pencil, Phone, Play, Plus, Radio, Receipt, RotateCcw, Route, ScanLine, Search, SearchX, Send, ShieldCheck, Sparkles, Speaker, Star, Store, Sun, Tent, Theater, Trash2, TrendingUp, Upload, UserCheck, UserPlus, Users, Wallet, Wheat, Zap } as const;
export type IconName = keyof typeof MAP;

export function Icon({ name, size = 20, ...p }: { name: string; size?: number } & Omit<LucideProps, "ref">) {
  const C = (MAP as Record<string, typeof Sparkles>)[name] ?? Sparkles;
  return <C size={size} strokeWidth={1.8} aria-hidden="true" {...p} />;
}
