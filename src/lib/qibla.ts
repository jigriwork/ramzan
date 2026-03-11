export const KAABA_COORDINATES = {
    latitude: 21.4225,
    longitude: 39.8262,
} as const;

export type CoordinateValidationErrorCode =
    | 'MISSING_COORDINATES'
    | 'INVALID_LATITUDE'
    | 'INVALID_LONGITUDE'
    | 'OUT_OF_RANGE_LATITUDE'
    | 'OUT_OF_RANGE_LONGITUDE';

export type CoordinateValidationResult =
    | {
        valid: true;
        latitude: number;
        longitude: number;
    }
    | {
        valid: false;
        code: CoordinateValidationErrorCode;
        message: string;
    };

function toRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number) {
    return (radians * 180) / Math.PI;
}

export function normalizeBearing(bearing: number): number {
    const normalized = ((bearing % 360) + 360) % 360;
    return Number(normalized.toFixed(2));
}

export function validateCoordinates(
    latitude: unknown,
    longitude: unknown,
): CoordinateValidationResult {
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return {
            valid: false,
            code: 'MISSING_COORDINATES',
            message: 'Latitude and longitude are required.',
        };
    }

    const lat = typeof latitude === 'number' ? latitude : Number(latitude);
    const lng = typeof longitude === 'number' ? longitude : Number(longitude);

    if (!Number.isFinite(lat)) {
        return {
            valid: false,
            code: 'INVALID_LATITUDE',
            message: 'Latitude must be a valid number.',
        };
    }

    if (!Number.isFinite(lng)) {
        return {
            valid: false,
            code: 'INVALID_LONGITUDE',
            message: 'Longitude must be a valid number.',
        };
    }

    if (lat < -90 || lat > 90) {
        return {
            valid: false,
            code: 'OUT_OF_RANGE_LATITUDE',
            message: 'Latitude must be between -90 and 90.',
        };
    }

    if (lng < -180 || lng > 180) {
        return {
            valid: false,
            code: 'OUT_OF_RANGE_LONGITUDE',
            message: 'Longitude must be between -180 and 180.',
        };
    }

    return {
        valid: true,
        latitude: lat,
        longitude: lng,
    };
}

export function calculateQiblaBearing(latitude: number, longitude: number): number {
    const latRad = toRadians(latitude);
    const lngRad = toRadians(longitude);
    const kaabaLatRad = toRadians(KAABA_COORDINATES.latitude);
    const kaabaLngRad = toRadians(KAABA_COORDINATES.longitude);

    const deltaLng = kaabaLngRad - lngRad;

    const y = Math.sin(deltaLng);
    const x =
        Math.cos(latRad) * Math.tan(kaabaLatRad) -
        Math.sin(latRad) * Math.cos(deltaLng);

    const bearing = toDegrees(Math.atan2(y, x));
    return normalizeBearing(bearing);
}
