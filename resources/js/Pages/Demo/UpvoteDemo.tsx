import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { UpvoteButton } from '@/Components/UpvoteButton';
import TicketLayout from '@/Layouts/TicketLayout';

interface UpvoteDemoProps {
  tickets: Array<{
    id: string;
    title: string;
    content: string;
    upvote_count: number;
    has_upvote: boolean;
  }>;
}

export default function UpvoteDemo({ tickets }: UpvoteDemoProps) {
  return (
    <TicketLayout title="Upvote Demo">
      <Head title="Upvote Demo" />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Upvote Button Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test the upvote functionality with different sizes and variants
          </p>
        </div>

        {/* Size Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Small</p>
                <UpvoteButton
                  postId="demo-1"
                  initialUpvoteCount={5}
                  initialHasUpvoted={false}
                  size="sm"
                  variant="card"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Medium</p>
                <UpvoteButton
                  postId="demo-2"
                  initialUpvoteCount={12}
                  initialHasUpvoted={true}
                  size="md"
                  variant="card"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Large</p>
                <UpvoteButton
                  postId="demo-3"
                  initialUpvoteCount={25}
                  initialHasUpvoted={false}
                  size="lg"
                  variant="card"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variant Types */}
        <Card>
          <CardHeader>
            <CardTitle>Variant Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Card Variant</p>
                <UpvoteButton
                  postId="demo-4"
                  initialUpvoteCount={8}
                  initialHasUpvoted={false}
                  size="md"
                  variant="card"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Detail Variant</p>
                <UpvoteButton
                  postId="demo-5"
                  initialUpvoteCount={15}
                  initialHasUpvoted={true}
                  size="md"
                  variant="detail"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Tickets */}
        {tickets && tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Real Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <UpvoteButton
                      postId={ticket.id}
                      initialUpvoteCount={ticket.upvote_count}
                      initialHasUpvoted={ticket.has_upvote}
                      size="sm"
                      variant="card"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {ticket.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {ticket.content.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* States */}
        <Card>
          <CardHeader>
            <CardTitle>Different States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Not Upvoted</p>
                <UpvoteButton
                  postId="demo-6"
                  initialUpvoteCount={0}
                  initialHasUpvoted={false}
                  size="md"
                  variant="card"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Upvoted</p>
                <UpvoteButton
                  postId="demo-7"
                  initialUpvoteCount={1}
                  initialHasUpvoted={true}
                  size="md"
                  variant="card"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Disabled</p>
                <UpvoteButton
                  postId="demo-8"
                  initialUpvoteCount={10}
                  initialHasUpvoted={false}
                  size="md"
                  variant="card"
                  disabled={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TicketLayout>
  );
}
