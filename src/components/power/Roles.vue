<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary">添加角色</el-button>
            </el-col>
        </el-row>

        <el-table :data="rolelist" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
                :class="[ 'bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
                  <!-- 一级权限 -->
                  <el-col :span="5">
                    <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 二级和三级权限 -->
                  <el-col :span="19">
                    <!-- 通过for循环渲染二级权限 -->
                    <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                    :class="[ 'bdbottom', i2 === 0 ? '' : 'bdtop', 'vcenter']">
                      <!-- 二级权限 -->
                      <el-col :span="6">
                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 三级权限 -->
                      <el-col :span="18">
                        <el-tag type="warning" v-for="item3 in item2.children"
                        :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
                <!-- <pre>{{scope.row}}</pre> -->
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mini"
                    @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <!-- // 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%"
    @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id"
      default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolelist: [],
      setRightDialogVisible: false,
      // 所有权限数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 分配权限的默认项
      defKeys: [],
      // 当前即将分配权限的id
      roleID: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
    //   console.log(this.rolelist)
    },
    // 根据ID删掉三级权限中的额组件
    async removeRightById (role, rightID) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 确认后发送删除信息
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightID}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      console.log(res.data)
      // this.getRolesList()
      role.children = res.data
    },
    async showSetRightDialog (role) {
      this.roleID = role.id

      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }

      this.rightslist = res.data
      // console.log(this.rightslist)
      // 递归获取 三级权限
      this.getLeafKey(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的方式 获取角色下的所有三级权限的id 保存到defKey
    getLeafKey (node, arr) {
      // 如果当前结点不包含children则是三级
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKey(item, arr))
    },
    // 监听分配权限对话框的关闭
    setRightDialogClosed () {
      // 关闭就要清空
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      // 展开运算符 ...
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys)
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleID}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang = "less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
