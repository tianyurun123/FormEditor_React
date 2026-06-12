import { memo, useState, useEffect } from 'react';
import { Space, Button, Tabs } from 'antd';
import IconFont from './IconFont';
import Spin from './Spin';
import loadMonaco from '@/assets/utils/loadMonaco';
import { saveAs } from 'file-saver';
import ClipboardJS from 'clipboard';
import beautify from 'js-beautify';
import useMessage from '@/hooks/useMessage';
import { generateVueCode, generateAddressDataFile } from '@/assets/utils/generateVueCode';
import type { baseProps } from '@/assets/utils/formConfig/editorConfig';
import '@/assets/style/jsonDrawer.less';

type objTypes = {
  [key: string]: any
}

interface headerTypes {
  content: string,
  align: string,
  imageList: Array<string>
}

interface formConfigTypes {
  title?: string,
  header?: headerTypes,
  list?: Array<baseProps>,
  result?: {
    content?: string,
    align?: string,
    imageList?: Array<string>
  }
}

type propsTypes = {
  formData: formConfigTypes | null,
  open: boolean,
  onClose: () => void
}

const htmlBeautifyConf: objTypes = {
  indent_size: '2',
  indent_char: ' ',
  max_preserve_newlines: '1',
  preserve_newlines: true,
  keep_array_indentation: false,
  break_chained_methods: false,
  indent_scripts: 'normal',
  brace_style: 'expand',
  space_before_conditional: true,
  unescape_strings: false,
  jslint_happy: false,
  end_with_newline: true,
  wrap_line_length: '0',
  indent_inner_html: true,
  comma_first: false,
  e4x: true,
  indent_empty_lines: false,
  wrap_attributes: 'auto',
  wrap_attributes_indent_size: '2',
}

let monaco: objTypes;

/* Vue3 + Element-Plus 代码预览 */
function VueCodePreview(props: propsTypes) {

  const { formData, open, onClose } = props;

  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<objTypes | null>(null);
  const [vueCode, setVueCode] = useState('');
  const [addressCode, setAddressCode] = useState('');
  const [activeTab, setActiveTab] = useState('vue');

  const message = useMessage();

  /* 周期函数 */
  useEffect(() => {
    if (open && formData) {
      // 生成 Vue3 + Element-Plus 代码
      const code = generateVueCode(formData);
      // 美化 Vue 代码（使用 HTML beautifier，因为 Vue SFC 以 template 为主）
      try {
        const beautified = beautify.html(code, htmlBeautifyConf);
        setVueCode(beautified);
      } catch {
        setVueCode(code);
      }

      // 生成 address 数据文件
      const hasAddress = formData.list?.some(item => item.tag === 'address');
      if (hasAddress) {
        setAddressCode(generateAddressDataFile());
      } else {
        setAddressCode('');
      }

      // 加载 Monaco 编辑器
      loadMonaco((val: objTypes) => {
        monaco = val;
        setLoading(false);
        const codeStr = beautify.html(code, htmlBeautifyConf);
        setEditorValue('vue-editor', codeStr);
      });
    }
  }, [open, formData]);

  /* 切换 tab */
  useEffect(() => {
    if (!editor || loading) return;
    if (activeTab === 'vue') {
      try {
        const beautified = beautify.html(vueCode, htmlBeautifyConf);
        editor.setValue(beautified);
        monaco.editor.setModelLanguage(editor.getModel(), 'html');
      } catch {
        editor.setValue(vueCode);
      }
    } else if (activeTab === 'address') {
      editor.setValue(addressCode);
      monaco.editor.setModelLanguage(editor.getModel(), 'javascript');
    }
  }, [activeTab, editor, loading]);

  /* 设置 editor 数据对象 */
  const setEditorValue = (id: string, codeStr: string) => {
    if (editor) {
      editor.setValue(codeStr);
    } else {
      setEditor(() => monaco.editor.create(document.getElementById(id) as HTMLElement, {
        value: codeStr,
        theme: 'vs-dark',
        language: activeTab === 'address' ? 'javascript' : 'html',
        automaticLayout: true,
        fontSize: 13,
        minimap: { enabled: false },
        wordWrap: 'on',
      }));
    }
  };

  /* 复制代码 */
  const copyCode = () => {
    const codeToCopy = activeTab === 'vue' ? vueCode : addressCode;
    const clipboard = new ClipboardJS('.copy-vue-btn', {
      text: () => {
        message.success('代码已复制到剪切板');
        return codeToCopy;
      }
    });
    clipboard.on('error', () => {
      message.error('代码复制失败，稍后重试');
    });
  };

  /* 导出 Vue 文件 */
  const exportVueFile = () => {
    const blob = new Blob([vueCode], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'DynamicForm.vue');
  };

  /* 导出 Address 数据文件 */
  const exportAddressFile = () => {
    const blob = new Blob([addressCode], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'address-data.ts');
  };

  const hasAddress = formData?.list?.some(item => item.tag === 'address');

  // Tab 配置
  const tabItems = [
    { label: 'DynamicForm.vue', key: 'vue' },
    ...(hasAddress ? [{ label: 'address-data.ts', key: 'address' }] : []),
  ];

  return (
    <Spin spinning={loading} tips="正在生成 Vue3 代码..." delay={300}>
      <div className="json-wrapper">
        <div className="option-bar">
          <Space size={0}>
            <Button type="link" icon={<IconFont type="icon-fuzhi" />} onClick={copyCode} className="copy-vue-btn">
              复制{activeTab === 'vue' ? 'Vue' : '数据'}代码
            </Button>
            <Button type="link" icon={<IconFont type="icon-xiazai" />}
              onClick={activeTab === 'vue' ? exportVueFile : exportAddressFile}>
              导出{activeTab === 'vue' ? 'Vue' : '数据'}文件
            </Button>
          </Space>
        </div>
        {tabItems.length > 1 ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="vue-tabs"
            size="small"
            items={tabItems}
          />
        ) : null}
        <div id="vue-editor" className="json-editor"></div>
      </div>
    </Spin>
  )
}

export default memo(VueCodePreview);
