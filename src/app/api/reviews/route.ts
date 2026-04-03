import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';  // ← fix: use connectDB
import Review from '@/lib/models/Review';

export async function GET() {
  try {
    await connectDB();  // ← use connectDB
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();  // ← use connectDB

    // Generate a new unique id (incremental)
    const lastReview = await Review.findOne().sort({ id: -1 });
    const newId = lastReview ? lastReview.id + 1 : 1;

    const newReview = await Review.create({
      ...body,
      id: newId,
      rating: Number(body.rating),
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}