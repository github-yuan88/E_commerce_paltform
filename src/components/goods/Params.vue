/* eslint-disable camelcase */
/* eslint-disable camelcase */
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
        <!-- 警告区域 -->
      <el-alert title="注意“只允许为第三级分类设置相关参数" type="warning" :closable="false"></el-alert>

       <!-- 选择商品分类区 -->
       <el-row class="cat_opt">
           <el-col>
               <span>选择商品分类:</span>
               <!-- 联级选择框 -->
                <el-cascader class="kuang"
                v-model="selectedCateKeys"
                :options="catelist"
                :props="catePorps"
                @change="handleChange"></el-cascader>
           </el-col>
       </el-row>

       <!-- tab标签区 -->
       <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mini"
                :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                   <!-- 展开行 -->
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                        <!-- 循环渲染表情啊 -->
                        <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handClose(i , scope.row)">
                          {{item}}</el-tag>
                        <!-- 输入的文本框 -->
                        <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)"
                        >
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiog(scope.row.attr_id)">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini"
                 :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                <!-- 静态表格 -->
                <el-table :data="onlyTableData" border stripe>
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                        <!-- 循环渲染表情啊 -->
                        <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handClose(i , scope.row)">
                          {{item}}</el-tag>
                        <!-- 输入的文本框 -->
                        <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)"
                        >
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiog(scope.row.attr_id)">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
    :title="'添加' + titleText"
    :visible.sync="addDialogVisible"
    width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
    :title="'修改' + titleText"
    :visible.sync="editDialogVisible"
    width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      catelist: [],
      //   级联选择框对象
      catePorps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCateKeys: [],
      // 被激活的标签页
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 控制对话框的显示和隐藏
      addDialogVisible: false,
      // 添加表单的数据对象
      addForm: {},
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改对话框的显示
      editDialogVisible: false,
      // 修改对话框的数据对象
      editForm: {},
      // 修改对话框的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
      // // 控制按钮 与 文本框的切换
      // inputVisible: false,
      // // 文本框中输入内容
      // inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品的分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')

      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择框变化
    handleChange () {
    //   console.log(this.selectedCateKeys)
      this.getParamsData()
    },
    // tab标签点击事件处理函数
    handleTabClick () {
    //   console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数列表数据 要单独提出来 否则tab标签切换的时候不可以
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        // 保证选了三级标题后选二级标题会情况
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }

      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')

      // 本来attr_vals是以空格隔开  但是要把它变成一个数组  好分配标签
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals
          ? item.attr_vals.split(' ') : []
          // 控制文本框的显示和隐藏
        item.inputVisible = false
        item.inputValue = ''
      })

      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 对话框关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮 展示修改的对话框
    async showEditDiog (attrid) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, {
        params: { attr_sel: this.activeName }
      })

      if (res.meta.status !== 200) return this.$message.error('获取参数失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭修改对话框 清空
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮 提交修改参数信息
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async removeParams (attrid) {
      const confirmReult = await
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmReult !== 'confirm') return this.$message.info('已取消删除！')

      // 删除
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 文本框失去焦点 按下enter都会触发
    handleInputConfirm (row) {
      console.log('ok')
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    async saveAttrVals (row) {
      // 发起请求
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) return this.$message.error('修改参数项失败！')
      this.$message.success('修改参数项成功！')
    },
    // 点击按钮显示文本框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮被禁用 则返回true
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    // 当前选中的三级分类id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 计算标题属性
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }

  }
}
</script>

<style lang = "less" scoped>
.cat_opt {
    margin-top: 15px;
}
.kuang {
    margin-left: 15px;
    width: 300px;
}
.el-tag {
  margin:10px;
}
.input-new-tag {
  width: 120px;
}
</style>
