import { NextRequest, NextResponse } from 'next/server';
import { qiblaService } from '@/services/qiblaService';

type QiblaApiPayload = {
    lat?: unknown;
    lng?: unknown;
    latitude?: unknown;
    longitude?: unknown;
};

function pickCoordinates(input: QiblaApiPayload) {
    return {
        latitude: input.latitude ?? input.lat,
        longitude: input.longitude ?? input.lng,
    };
}

function jsonFromResult(result: ReturnType<typeof qiblaService.getQiblaFromCoordinates>) {
    if (!result.success) {
        return NextResponse.json(
            {
                success: false,
                status: result.status,
                qiblaBearing: null,
                coordinates: {
                    userLatitude: result.userLatitude,
                    userLongitude: result.userLongitude,
                    kaabaLatitude: result.kaabaLatitude,
                    kaabaLongitude: result.kaabaLongitude,
                },
                error: result.error,
            },
            { status: 400 },
        );
    }

    return NextResponse.json({
        success: true,
        status: result.status,
        qiblaBearing: result.qiblaBearing,
        coordinates: {
            userLatitude: result.userLatitude,
            userLongitude: result.userLongitude,
            kaabaLatitude: result.kaabaLatitude,
            kaabaLongitude: result.kaabaLongitude,
        },
        error: null,
    });
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const latitude = params.get('latitude') ?? params.get('lat');
    const longitude = params.get('longitude') ?? params.get('lng');

    const result = qiblaService.getQiblaFromCoordinates({ latitude, longitude });
    return jsonFromResult(result);
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as QiblaApiPayload;
        const { latitude, longitude } = pickCoordinates(body || {});
        const result = qiblaService.getQiblaFromCoordinates({ latitude, longitude });
        return jsonFromResult(result);
    } catch {
        const result = qiblaService.getQiblaFromCoordinates({ latitude: undefined, longitude: undefined });
        return jsonFromResult(result);
    }
}
