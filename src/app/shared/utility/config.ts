import {  StaffAccess } from "src/app/models/staff-access";
import { ColumnDefinition } from "./table"
import { AccessPages } from "../models/acces-pages.model";

export interface AppConfig {
    appName: string;
    reservationConfig: {
      maxCancellation: string;
      daysCancellationLimitReset: string;
      timeSlotHours: {
        start: string;
        end: string;
      };
      timeSlotNotAvailableHours: string[];
      dayOfWeekNotAvailable: string[];
    };
    tableColumns: {
      staffUser: ColumnDefinition[];
      staffAccess: ColumnDefinition[];
      customerUser: ColumnDefinition[];
      product: ColumnDefinition[];
      category: ColumnDefinition[];
      giftAddOns: ColumnDefinition[];
      discounts: ColumnDefinition[];
      order: ColumnDefinition[];
    };
    sessionConfig: {
      sessionTimeout: string;
    };
    lookup: {
      accessPages: AccessPages[];
    };
    apiEndPoints: {
      auth: {
        login: string;
        registerClient: string;
      };
      staffUser: {
        getByCode: string;
        create: string;
        updateProfile: string;
        update: string;
        getAdvanceSearch: string;
        delete: string;
      };
      staffAccess: {
        getByAdvanceSearch: string;
        getByCode: string;
        create: string;
        update: string;
        delete: string;
      };
      customerUser: {
        getByCode: string;
        updateProfile: string;
        update: string;
        getAdvanceSearch: string;
        delete: string;
      };
      category: {
        getByCode: string;
        create: string;
        update: string;
        updateOrder: string;
        getAdvanceSearch: string;
        delete: string;
      };
      giftAddOns: {
        getByCode: string;
        create: string;
        update: string;
        updateOrder: string;
        getAdvanceSearch: string;
        delete: string;
      };
      discounts: {
        getByCode: string;
        create: string;
        update: string;
        updateOrder: string;
        getAdvanceSearch: string;
        delete: string;
      };
      collection: {
        getByCode: string;
        create: string;
        update: string;
        updateFeatured: string;
        updateOrder: string;
        getAdvanceSearch: string;
        delete: string;
      };
      product: {
        getByCode: string;
        create: string;
        update: string;
        getAdvanceSearch: string;
        delete: string;
      };
      order: {
        getAdvanceSearch: string;
        getByCode: string;
        updateStatus: string;
      },
      settings: {
        getAll: string;
        find: string;
        save: string;
      };
      dashboard: {
      };
      message: { create: string };
      systemConfig: {
        getAll: string;
        find: string;
        update: string;
      },
      geolocation: {
        searchAddress: string;
      }
    };
  }
