import { baseProps, optionProps, cascaderModeTypes } from './formConfig/editorConfig';

interface objProps {
  [key: string]: any
}

interface formConfigTypes {
  title?: string,
  header?: {
    content: string,
    align: string,
    imageList: Array<string>
  },
  list?: Array<baseProps>,
  result?: {
    content?: string,
    align?: string,
    imageList?: Array<string>
  }
}

/**
 * 将字符串形式的正则表达式转换为真正的 RegExp 字符串表示
 * 例如: '/^1[35789]\\d{9}$/' → '/^1[35789]\d{9}$/'
 */
function parsePatternString(patternStr: string): string {
  if (!patternStr) return '/.*/';
  // Remove leading/trailing slashes and flags
  const match = patternStr.match(/^\/(.+)\/([gimuy]*)$/);
  if (match) {
    // Unescape double-backslashes for the generated code
    const body = match[1].replace(/\\\\/g, '\\');
    const flags = match[2] || '';
    return `/${body}/${flags}`;
  }
  return patternStr;
}

/**
 * 生成 Element-Plus 表单验证规则
 */
function generateRules(item: baseProps): string {
  const rules: string[] = [];

  if (item.required) {
    rules.push(`  { required: true, message: '此题为必填，请将内容补充完整', trigger: '${item.tag === 'input' || item.tag === 'textarea' ? 'blur' : 'change'}' }`);
  }

  // 选择题的 min/max 限制
  if (item.multiple && (item.max || item.min)) {
    if (item.max && item.min && item.max === item.min) {
      rules.push(`  { type: 'array', min: ${item.max}, max: ${item.max}, message: '此题限定选择 ${item.max} 项', trigger: 'change' }`);
    } else {
      if (item.max) {
        rules.push(`  { type: 'array', max: ${item.max}, message: '最多选择 ${item.max} 项', trigger: 'change' }`);
      }
      if (item.min) {
        rules.push(`  { type: 'array', min: ${item.min}, message: '最少选择 ${item.min} 项', trigger: 'change' }`);
      }
    }
  }

  // 输入框的 max/min 字符限制
  if ((item.tag === 'input' || item.tag === 'textarea') && (item.max || item.min)) {
    if (item.max) {
      rules.push(`  { max: ${item.max}, message: '最多输入 ${item.max} 个字符', trigger: 'blur' }`);
    }
    if (item.min) {
      rules.push(`  { min: ${item.min}, message: '最少输入 ${item.min} 个字符', trigger: 'blur' }`);
    }
  }

  // 自定义正则规则
  if (item.rules && item.rules.length) {
    item.rules.forEach((rule: objProps) => {
      const patternStr = parsePatternString(rule.pattern);
      rules.push(`  { pattern: ${patternStr}, message: '${rule.message}', trigger: '${item.tag === 'input' || item.tag === 'textarea' ? 'blur' : 'change'}' }`);
    });
  }

  if (rules.length === 0) {
    return '[]';
  }

  return `[\n${rules.join(',\n')}\n]`;
}

/**
 * 生成选择题选项的 Vue 模板
 */
function generateSelectOptions(item: baseProps): string {
  if (!item.options || !item.options.length) return '';

  return item.options.map((opt: optionProps, idx: number) => {
    const label = opt.label || `选项${idx + 1}`;
    const labelStr = label.replace(/"/g, "'");
    if (opt.mode === 0) {
      // "其他" 选项
      return `        <el-${item.tag === 'radio' ? 'radio' : item.tag === 'checkbox' ? 'checkbox' : ''} label="${opt.id}" value="${opt.id}">${labelStr}</el-${item.tag === 'radio' ? 'radio' : item.tag === 'checkbox' ? 'checkbox' : ''}>`;
    }
    return `        <el-${item.tag === 'radio' ? 'radio' : item.tag === 'checkbox' ? 'checkbox' : ''} label="${opt.id}" value="${opt.id}">${labelStr}</el-${item.tag === 'radio' ? 'radio' : item.tag === 'checkbox' ? 'checkbox' : ''}>`;
  }).join('\n');
}

/**
 * 生成下拉选项
 */
function generateDropdownOptions(item: baseProps): string {
  if (!item.options || !item.options.length) return '';
  return item.options
    .filter((opt: optionProps) => opt.mode !== 0)
    .map((opt: optionProps, idx: number) => {
      const label = opt.label || `选项${idx + 1}`;
      const labelStr = label.replace(/"/g, "'");
      return `        <el-option label="${labelStr}" :value="${opt.id}" />`;
    }).join('\n');
}

/**
 * 生成多段填空的 Vue 模板
 */
function generateMultiInput(item: baseProps, fieldName: string): string {
  const question = item.question || '填空1＿＿＿＿，填空2＿＿＿＿';
  const parts = question.split('＿＿＿＿');
  if (parts.length <= 1) return '';

  const inputs: string[] = [];
  parts.forEach((part: string, idx: number) => {
    if (part) {
      inputs.push(`        <span class="multi-text">${part}</span>`);
    }
    if (idx < parts.length - 1) {
      inputs.push(`        <el-input v-model="formData.${fieldName}_${idx}" class="multi-input" placeholder="请输入" />`);
    }
  });

  return inputs.join('\n');
}

/**
 * 生成级联选择/地址的占位符
 */
function generateCascaderPlaceholder(cascaderMode: Array<cascaderModeTypes>): string {
  return cascaderMode.filter(item => item.text.trim().length).map(item => item.text).join('/') || '请选择';
}

/**
 * 生成日期选择器的格式
 */
function getDateFormat(picker: string): string {
  const formats: objProps = {
    month: 'YYYY-MM',
    date: 'YYYY-MM-DD',
    minute: 'YYYY-MM-DD HH:mm'
  };
  return formats[picker] || 'YYYY-MM-DD';
}

/**
 * 生成日期选择器的类型
 */
function getDateType(picker: string): string {
  const types: objProps = {
    month: 'month',
    date: 'date',
    minute: 'datetime'
  };
  return types[picker] || 'date';
}

/**
 * 生成单个表单项的 Vue 模板
 */
function generateFormItem(item: baseProps, index: number): string {
  const fieldName = `field_${index}`;
  const required = item.required ? ' required' : '';
  const title = item.title || `问题${index + 1}`;
  const titleStr = title.replace(/"/g, "'");

  let template = '';

  switch (item.tag) {
    case 'input':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-input v-model="formData.${fieldName}" placeholder="请输入"${item.max ? ` maxlength="${item.max}"` : ''} />
        </el-form-item>`;
      break;

    case 'textarea':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-input v-model="formData.${fieldName}" type="textarea" placeholder="请输入" :rows="3"${item.max ? ` maxlength="${item.max}"` : ''} />
        </el-form-item>`;
      break;

    case 'radio':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-radio-group v-model="formData.${fieldName}">
${generateSelectOptions(item)}
          </el-radio-group>
        </el-form-item>`;
      break;

    case 'checkbox':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-checkbox-group v-model="formData.${fieldName}">
${generateSelectOptions(item)}
          </el-checkbox-group>
        </el-form-item>`;
      break;

    case 'select':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-select v-model="formData.${fieldName}" placeholder="请选择"${item.multiple ? ' multiple' : ''} clearable>
${generateDropdownOptions(item)}
          </el-select>
        </el-form-item>`;
      break;

    case 'multipInput':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <div class="multi-input-group">
${generateMultiInput(item, fieldName)}
          </div>
        </el-form-item>`;
      break;

    case 'rate':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-rate v-model="formData.${fieldName}" :max="${item.count || 5}" />
        </el-form-item>`;
      break;

    case 'date':
      {
        const dateFormat = getDateFormat(item.picker);
        const dateType = getDateType(item.picker);
        template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-date-picker v-model="formData.${fieldName}" type="${dateType}" format="${dateFormat}" value-format="${dateFormat}" placeholder="请选择日期" />
        </el-form-item>`;
      }
      break;

    case 'range':
      {
        const rangeFormat = getDateFormat(item.picker);
        const rangeType = getDateType(item.picker);
        template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-date-picker v-model="formData.${fieldName}" type="${rangeType}range" format="${rangeFormat}" value-format="${rangeFormat}" start-placeholder="开始" end-placeholder="结束" />
        </el-form-item>`;
      }
      break;

    case 'cascader':
      {
        const placeholder = generateCascaderPlaceholder(item.cascaderMode || []);
        template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-cascader v-model="formData.${fieldName}" :options="${fieldName}CascaderOptions" placeholder="${placeholder}" clearable />
        </el-form-item>`;
      }
      break;

    case 'address':
      {
        template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <el-cascader v-model="formData.${fieldName}" :options="addressOptions" placeholder="请选择省/市/区" :props="{ value: 'value', label: 'label', children: 'children' }" clearable />
        </el-form-item>`;
      }
      break;

    case 'signature':
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <div class="signature-area" @click="openSignature">
            <img v-if="formData.${fieldName}" :src="formData.${fieldName}" class="signature-img" />
            <span v-else class="signature-placeholder">点击签名</span>
          </div>
        </el-form-item>`;
      break;

    case 'table':
      {
        const cols = item.columns || [];
        const rows = item.rowCount || 3;
        const showRowLabel = item.showRowLabel || false;
        const rowLabels = item.rowLabels || [];
        const colDefs = cols.map((c: any, i: number) => `  { label: '${(c.label || `列${i + 1}`).replace(/'/g, "\\'")}' }`).join(',\n');
        template = `        <el-form-item label="${titleStr}" prop="${fieldName}"${required}>
          <div class="write-table-wrapper">
            <el-table :data="${fieldName}TableData" border stripe size="small" class="write-table">
              ${showRowLabel ? `<el-table-column label="行标签" width="100" fixed="left">
                <template #default="{ $index }">
                  <span>{{ ${fieldName}RowLabels[$index] || '行' + ($index + 1) }}</span>
                </template>
              </el-table-column>` : ''}
              <el-table-column v-for="(col, colIdx) in ${fieldName}Columns" :key="colIdx" :label="col.label">
                <template #default="{ row, $index }">
                  <el-input v-model="${fieldName}TableData[$index][colIdx]" placeholder="" size="small" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>`;
      }
      break;

    default:
      template = `        <el-form-item label="${titleStr}" prop="${fieldName}">
          <el-input v-model="formData.${fieldName}" placeholder="请输入" />
        </el-form-item>`;
  }

  // 添加题目说明
  if (item.noteShow && item.note) {
    const noteStr = item.note.replace(/"/g, "'");
    template = template.replace(
      `label="${titleStr}"`,
      `label="${titleStr}"\n          :rules="[{ required: false }]"`
    );
    // Add description before the form-item content
    template = template.replace('>', '>\n          <template #label><span>${titleStr}</span><span class="question-note">${noteStr}</span></template>');
  }

  return template;
}

/**
 * 生成 formData 初始数据
 */
function generateFormData(list: Array<baseProps>): string {
  const fields: string[] = [];
  list.forEach((item, index) => {
    const fieldName = `field_${index}`;
    switch (item.tag) {
      case 'checkbox':
        fields.push(`  ${fieldName}: []`);
        break;
      case 'select':
        fields.push(`  ${fieldName}: ${item.multiple ? '[]' : "''"}`);
        break;
      case 'rate':
        fields.push(`  ${fieldName}: 0`);
        break;
      case 'date':
      case 'range':
        fields.push(`  ${fieldName}: ''`);
        break;
      case 'cascader':
      case 'address':
        fields.push(`  ${fieldName}: []`);
        break;
      case 'table':
        fields.push(`  ${fieldName}: ''`);
        break;
      case 'multipInput':
        {
          const question = item.question || '填空1＿＿＿＿，填空2＿＿＿＿';
          const parts = question.split('＿＿＿＿');
          for (let i = 0; i < parts.length - 1; i++) {
            fields.push(`  ${fieldName}_${i}: ''`);
          }
        }
        break;
      default:
        fields.push(`  ${fieldName}: ''`);
    }
  });
  return fields.join(',\n');
}

/**
 * 生成 formRules 验证规则
 */
function generateFormRules(list: Array<baseProps>): string {
  const rules: string[] = [];
  list.forEach((item, index) => {
    const fieldName = `field_${index}`;
    const itemRules = generateRules(item);
    if (itemRules !== '[]') {
      rules.push(`  ${fieldName}: ${itemRules}`);
    }
  });
  if (rules.length === 0) return '{}';
  return `{\n${rules.join(',\n')}\n}`;
}

/**
 * 生成 cascader 选项数据占位
 */
function generateCascaderOptions(list: Array<baseProps>): string {
  const options: string[] = [];
  list.forEach((item, index) => {
    if (item.tag === 'cascader' && item.options && item.options.length) {
      const fieldName = `field_${index}`;
      options.push(`const ${fieldName}CascaderOptions = ${JSON.stringify(item.options, null, 2)}`);
    }
  });
  return options.join('\n\n');
}

/**
 * 生成表格组件所需的响应式变量
 */
function generateTableVariables(list: Array<baseProps>): string {
  const variables: string[] = [];
  list.forEach((item, index) => {
    if (item.tag === 'table') {
      const fieldName = `field_${index}`;
      const cols = item.columns || [];
      const rowCount = item.rowCount || 3;
      const showRowLabel = item.showRowLabel || false;
      const rowLabels = item.rowLabels || [];

      // 列定义
      const colDefs = cols.map((c: any, i: number) =>
        `  { label: '${(c.label || `列${i + 1}`).replace(/'/g, "\\'")}' }`
      ).join(',\n');
      variables.push(`// 表格：${item.title || `字段${index + 1}`}
const ${fieldName}Columns = ref([
${colDefs}
])`);

      // 表数据（2D数组）
      const emptyRows = Array.from({ length: rowCount }, () =>
        `    [${cols.map(() => "''").join(', ')}]`
      ).join(',\n');
      variables.push(`const ${fieldName}TableData = ref([
${emptyRows}
])`);

      // 行标签
      if (showRowLabel) {
        const labels = Array.from({ length: rowCount }, (_, i) =>
          `  '${(rowLabels[i] || `行${i + 1}`).replace(/'/g, "\\'")}'`
        ).join(',\n');
        variables.push(`const ${fieldName}RowLabels = ref([
${labels}
])`);
      } else {
        variables.push(`const ${fieldName}RowLabels = ref([])`);
      }
      variables.push(''); // blank line between tables
    }
  });
  return variables.join('\n');
}

/**
 * 主函数：生成完整的 Vue3 + Element-Plus SFC 代码
 */
export function generateVueCode(formData: formConfigTypes): string {
  const { title = '表单', header, list = [], result } = formData;
  const headerContent = header?.content || '';
  const headerAlign = header?.align || 'center';

  // 只处理可见的表单项
  const visibleList = list.filter(item => item.isShow !== false);

  // 生成表单项模板
  const formItems = visibleList
    .map((item, index) => generateFormItem(item, index))
    .join('\n\n');

  // 生成 formData（仅可见项）
  const formDataInit = generateFormData(visibleList);

  // 生成 rules（仅可见项）
  const formRules = generateFormRules(visibleList);

  // 生成 cascader options
  const cascaderOpts = generateCascaderOptions(visibleList);

  // 生成表格响应式变量
  const tableVars = generateTableVariables(visibleList);

  // 生成提交处理中的字段收集
  const submitFields = visibleList.map((item, index) => {
    const fieldName = `field_${index}`;
    if (item.tag === 'table') {
      return `  ${fieldName}: ${fieldName}TableData`;
    }
    if (item.tag === 'multipInput') {
      const question = item.question || '填空1＿＿＿＿，填空2＿＿＿＿';
      const parts = question.split('＿＿＿＿');
      const multiFields = [];
      for (let i = 0; i < parts.length - 1; i++) {
        multiFields.push(`${fieldName}_${i}: formData.${fieldName}_${i}`);
      }
      return `  ${fieldName}: { ${multiFields.join(', ')} }`;
    }
    return `  ${fieldName}: formData.${fieldName}`;
  }).join(',\n');

  // 生成 address options 的引用
  const hasAddress = visibleList.some(item => item.tag === 'address');

  // 生成结束语
  const resultContent = result?.content || '';
  const resultAlign = result?.align || 'center';

  const code = `<template>
  <div class="form-container">
    <!-- 表单头部 -->
    <div class="form-header">
      <h2 class="form-title">${title}</h2>
      ${headerContent ? `<p class="form-description" style="text-align: ${headerAlign}">${headerContent}</p>` : ''}
    </div>

    <!-- 表单主体 -->
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="dynamic-form">
${formItems}
    </el-form>

    <!-- 表单结束语 -->
    ${resultContent ? `<div class="form-footer" style="text-align: ${resultAlign}">
      <p>${resultContent}</p>
    </div>` : ''}

    <!-- 提交按钮 -->
    <div class="form-actions">
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
${hasAddress ? `import { addressOptions } from './address-data'` : ''}

const formRef = ref(null)

const formData = reactive({
${formDataInit}
})

const formRules = reactive(${formRules})

${cascaderOpts ? cascaderOpts : ''}
	${tableVars ? '\n' + tableVars : ''}

/**
 * 提交表单
 */
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const submitData = {
${submitFields}
      }
      console.log('提交数据：', submitData)
      ElMessage.success('表单提交成功')
    } else {
      ElMessage.warning('请检查表单填写内容')
    }
  })
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.form-header {
  margin-bottom: 24px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}

.form-description {
  color: #666;
  font-size: 14px;
}

.dynamic-form {
  margin-bottom: 24px;
}

.form-footer {
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
}

.form-actions {
  text-align: center;
}

.multi-input-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.multi-input {
  width: 120px;
}

.multi-text {
  white-space: nowrap;
}

.signature-area {
  width: 200px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.signature-placeholder {
  color: #999;
}

.signature-img {
  max-width: 100%;
  max-height: 100%;
}

.question-note {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}
</style>`;

  return code;
}

/**
 * 生成单独的 address 数据文件内容
 */
export function generateAddressDataFile(): string {
  return `/**
 * 省市区数据
 * 替换为实际的省市区数据源
 */
export const addressOptions = [
  {
    value: '110000',
    label: '北京市',
    children: [
      {
        value: '110100',
        label: '北京市',
        children: [
          { value: '110101', label: '东城区' },
          { value: '110102', label: '西城区' },
          { value: '110105', label: '朝阳区' },
          { value: '110106', label: '丰台区' },
          { value: '110107', label: '石景山区' },
          { value: '110108', label: '海淀区' },
        ]
      }
    ]
  },
  {
    value: '310000',
    label: '上海市',
    children: [
      {
        value: '310100',
        label: '上海市',
        children: [
          { value: '310101', label: '黄浦区' },
          { value: '310104', label: '徐汇区' },
          { value: '310105', label: '长宁区' },
          { value: '310106', label: '静安区' },
          { value: '310107', label: '普陀区' },
          { value: '310109', label: '虹口区' },
          { value: '310112', label: '闵行区' },
          { value: '310115', label: '浦东新区' },
        ]
      }
    ]
  }
]
`;
}
