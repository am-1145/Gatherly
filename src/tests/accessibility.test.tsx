import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import React from 'react';
import { Button } from '../components/common/Button';
import { Input, Textarea } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

describe('Deque axe-core Accessibility Audits', () => {
  it('Button component has zero axe-core violations', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary Action</Button>
        <Button variant="sage" isLoading>Saving...</Button>
        <Button variant="outline" aria-label="Custom action button">Click Me</Button>
      </div>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('Input & Textarea components with labels and errors pass axe accessibility rules', async () => {
    const { container } = render(
      <form>
        <Input
          label="Event Name"
          placeholder="e.g. Maya's 30th Birthday"
          hint="Choose an identifiable title"
        />
        <Input
          label="Budget Amount"
          error="Budget amount must be greater than zero"
          defaultValue="0"
        />
        <Textarea
          label="Event Description"
          placeholder="Describe your theme and requirements"
        />
      </form>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('Badge and Card components have zero axe-core violations', async () => {
    const { container } = render(
      <Card>
        <h3>Workspace Overview</h3>
        <p>Summary of current planning metrics</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="sage">Confirmed</Badge>
          <Badge variant="terracotta">Urgent</Badge>
          <Badge variant="neutral">Draft</Badge>
        </div>
      </Card>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('Modal dialog component enforces accessible name and role dialog', async () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Create New Expense"
        description="Add a vendor quotation or paid line item"
      >
        <p>Modal body content</p>
      </Modal>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('ConfirmDialog component meets accessible dialog requirements', async () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Expense Item"
        message="Are you sure you want to remove this line item? This cannot be undone."
      />
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
