<template>
  <div>
      <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
        <!-- 搜索框 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
             </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialongVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 用户列表列 -->
        <el-table :data="userList" border stripe>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态" prop="mg_state">
                <!-- 作用域插槽 -->
                <template slot-scope="scope">
                    <!-- {{scope.row}} -->
                    <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit"  size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete"  size="mini" @click="removeUserById(scope.row.id)"></el-button>
                    <!-- 分配角色按钮 enterable移开文本提示关闭-->
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialongVisible" width="50%" @close="addDialongClose">
      <!-- 表单填写区域 -->
      <el-form :model="addForm" :rules="addFromRules" ref="addFormRef" label-width="70px">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <!--  -->
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 表单底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialongVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialongVisible" width="50%" @close="editDialongClosed">
      <!-- 表单填写区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <!-- 用户名 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled=""></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <!-- 电话 -->
        <el-form-item label="电话">
          <el-input v-model="editForm.mobile" prop="mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 表单底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialongVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱规则
    var checkEmail = (rule, value, cb) => {
      // 邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 手机的正则表达式  ？的我的手机就不行
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号码'))
    }
    return {
    // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前页面的数据多少条
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialongVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则
      addFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户框的显示和隐藏
      editDialongVisible: false,
      // 修改用户所得到的信息
      editForm: {},
      // 修改表单的验证
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表的数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听 page/size 改变
    handleSizeChange (newsize) {
      // console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 监听页码值改变
    handleCurrentChange (newpage) {
      // console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    // 添加用户 发送信息
    async userStateChange (userinfo) {
      console.log(userinfo)
      // 动态参数 将单引号改为模板字符串
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听模态框关闭
    addDialongClose () {
      // 点击取消 清空表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定 预效验表单
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        // 发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏添加用的的对话框
        this.addDialongVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 用户修改信息的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('用户信息查询失败')
      }
      this.editForm = res.data
      this.editDialongVisible = true
    },
    // 修改表单的重置
    editDialongClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改表单信息提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发起请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        // 关闭对话框
        this.editDialongVisible = false
        // 跟新数据
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 删除用户前进行消息弹窗提醒
    async removeUserById (id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 删除用户
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户信息成功！')
      this.getUserList()
    }
  }
}
</script>

<style scoped>

</style>
