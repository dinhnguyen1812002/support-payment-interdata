
import { Settings, Link, Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export const EmptyState = React.memo(() => (
  <div className="text-center py-12">
    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Get started by creating your first automation rule to automatically categorize and route tickets.
    </p>
    <Link href="/admin/automation-rules/create">
      <Button size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Rule
      </Button>
    </Link>
  </div>
));
