
'use client';

import React from 'react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';
// @ts-ignore
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualListProps<T> {
    items: T[];
    height?: number | string;
    itemHeight: number;
    renderItem: ({ data, index, style }: { data: T[], index: number, style: React.CSSProperties }) => React.ReactElement;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

export function VirtualList<T>({ items, itemHeight, renderItem, height = '100%', onLoadMore, hasMore }: VirtualListProps<T>) {
    return (
        <div style={{ height, width: '100%' }}>
            <AutoSizer>
                {({ height: autoHeight, width: autoWidth }: any) => (
                    <List
                        height={autoHeight}
                        itemCount={items.length}
                        itemSize={itemHeight}
                        width={autoWidth}
                        itemData={items}
                        onItemsRendered={({ visibleStopIndex }: any) => {
                            if (hasMore && onLoadMore && visibleStopIndex >= items.length - 5) {
                                onLoadMore();
                            }
                        }}
                    >
                        {renderItem as any}
                    </List>
                )}
            </AutoSizer>
        </div>
    );
}
