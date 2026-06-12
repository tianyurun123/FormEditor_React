import { memo, useCallback } from 'react';
import { Input, InputNumber, Checkbox } from 'antd';
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { baseProps, objProps } from '@/assets/utils/formConfig/editorConfig';
import { useUpdate } from '@/hooks/useUpdate';
import useMessage from '@/hooks/useMessage';

interface columnTypes {
    label: string,
    id: number
}

type propTypes = {
    item: baseProps,
    modal?: boolean,
    tag?: string
}

/* 表格/矩阵组件配置 */
function ViewTable(props: propTypes) {

    const { item } = props;
    const message = useMessage();
    const update = useUpdate();

    const columns: columnTypes[] = item.columns || [];
    const rowCount: number = item.rowCount ?? 3;
    const showRowLabel: boolean = item.showRowLabel ?? false;
    const rowLabels: string[] = item.rowLabels || [];

    /* 修改列名 */
    const handleColumnLabelChange = useCallback((idx: number, value: string) => {
        update(() => {
            item.columns[idx].label = value;
        });
    }, []);

    /* 添加列 */
    const handleAddColumn = () => {
        if (columns.length >= 10) {
            message.warning('最多设置10列');
            return;
        }
        const maxId = Math.max(...columns.map(c => c.id), 0);
        update(() => {
            item.columns.push({ label: `列${columns.length + 1}`, id: maxId + 1 });
        });
    };

    /* 删除列 */
    const handleDeleteColumn = (idx: number) => {
        if (columns.length <= 2) {
            message.warning('至少保留两列');
            return;
        }
        update(() => {
            item.columns.splice(idx, 1);
        });
    };

    /* 修改行数 */
    const handleRowCountChange = (value: number | null) => {
        const count = value ?? 3;
        if (count < 1) {
            message.warning('至少保留一行');
            return;
        }
        if (count > 20) {
            message.warning('最多设置20行');
            return;
        }
        update(() => {
            item.rowCount = count;
        });
    };

    /* 修改是否显示行标签 */
    const handleShowRowLabelChange = (checked: boolean) => {
        update(() => {
            item.showRowLabel = checked;
            if (!checked) {
                item.rowLabels = [];
            }
        });
    };

    /* 修改行标签 */
    const handleRowLabelChange = (idx: number, value: string) => {
        update(() => {
            if (!item.rowLabels) {
                item.rowLabels = [];
            }
            item.rowLabels[idx] = value;
        });
    };

    // 生成预览行（只显示前5行）
    const previewRows = Math.min(rowCount, 5);
    const previewCols = Math.min(columns.length, 5);

    return (
        <>
            {/* 表格预览区域 */}
            <div className="table-preview-wrapper">
                <table className="table-preview">
                    <thead>
                        <tr>
                            {showRowLabel ? <th className="table-row-label-header">行标签</th> : null}
                            {columns.slice(0, previewCols).map((col, idx) => (
                                <th key={col.id}>
                                    <Input
                                        size="small"
                                        value={col.label}
                                        bordered={false}
                                        className="table-column-input"
                                        onChange={e => handleColumnLabelChange(idx, e.target.value)}
                                        placeholder={`列${idx + 1}`}
                                    />
                                </th>
                            ))}
                            {columns.length > previewCols ? <th>…</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: previewRows }, (_, rIdx) => (
                            <tr key={rIdx}>
                                {showRowLabel ? (
                                    <td className="table-row-label-cell">
                                        <Input
                                            size="small"
                                            value={rowLabels[rIdx] || ''}
                                            bordered={false}
                                            className="table-row-label-input"
                                            onChange={e => handleRowLabelChange(rIdx, e.target.value)}
                                            placeholder={`行${rIdx + 1}`}
                                        />
                                    </td>
                                ) : null}
                                {columns.slice(0, previewCols).map(col => (
                                    <td key={col.id}>
                                        <div className="table-cell-placeholder">填写者回答区</div>
                                    </td>
                                ))}
                                {columns.length > previewCols ? <td>…</td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rowCount > previewRows ? (
                    <div className="table-preview-more">… 共 {rowCount} 行</div>
                ) : null}
            </div>

            {/* 配置区域 */}
            <div className="form-item-setting">
                {/* 列配置 */}
                <div className="table-config-section">
                    <div className="table-config-label">列配置：</div>
                    <div className="table-columns-config">
                        {columns.map((col, idx) => (
                            <div key={col.id} className="table-column-config-item">
                                <span className="table-column-index">列{idx + 1}</span>
                                <Input
                                    size="small"
                                    value={col.label}
                                    onChange={e => handleColumnLabelChange(idx, e.target.value)}
                                    placeholder="列名"
                                    style={{ width: 90 }}
                                />
                                <CloseOutlined
                                    onClick={() => handleDeleteColumn(idx)}
                                    className="table-column-delete hover-color"
                                    title="删除列"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="setting-block opacity" onClick={handleAddColumn}>
                        <PlusCircleOutlined className="icon-block" />
                        <span>添加列</span>
                    </div>
                </div>

                <div className="split-add"></div>

                {/* 行数配置 */}
                <div className="table-row-config">
                    <span className="table-config-label">行数：</span>
                    <InputNumber
                        size="small"
                        min={1}
                        max={20}
                        value={rowCount}
                        onChange={handleRowCountChange}
                        style={{ width: 70 }}
                    />
                </div>

                <div className="split-add"></div>

                {/* 显示行标签 */}
                <div className="setting-block opacity">
                    <span onClick={() => handleShowRowLabelChange(!showRowLabel)}>行标签</span>
                    <Checkbox
                        checked={showRowLabel}
                        onChange={e => handleShowRowLabelChange(e.target.checked)}
                        className="multiple-checkbox"
                    />
                </div>
            </div>
        </>
    )
}

export default memo(ViewTable);
